#!/usr/bin/env bash
# ===========================================================================
# cutover.sh — agent-score Supabase -> RDS (agent_score) maintenance-window
# cutover (FER-11415). Source of truth for the cutover sequence.
#
#   DEPLOY_ENV=prod ./cutover.sh
#
# agent-score has NO dual-write / flag layer and writes come only from
# cron/scripts (generate-scores, rescore-*), not live user traffic — so a
# maintenance window is viable: quiesce the score jobs, dump, restore, repoint
# the Vercel env, redeploy. There is no live-traffic freeze flag to toggle.
#
# WHAT THIS SCRIPT DOES vs WHAT THE OPERATOR DOES
#   - DB work (create db, schema/data restore, sequence bump, validation) runs
#     here against the connection strings in config.prod.sh.
#   - The RDS snapshot, the og-images S3 copy, and the Vercel env repoint +
#     redeploy + promote are gated behind confirm prompts; the exact commands
#     are printed so you run them in another terminal (or this script runs the
#     ones it can when you confirm). Vercel changes are NOT AWS — see RUNBOOK.md.
#
# Idempotent: the data restore TRUNCATEs first, so re-running is safe. Aborts
# leave RDS untouched-enough to retry; the app keeps serving Supabase until you
# actually repoint the Vercel env.
# ===========================================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "${SCRIPT_DIR}/lib.sh"

log()    { echo -e "\n=== $* ==="; }
abort()  { echo "ABORT: $*" >&2; exit 1; }
confirm() { read -r -p ">> $* [y/N] " a; [[ "$a" == "y" || "$a" == "Y" ]] || abort "operator declined: $*"; }

TABLES="$(all_tables)"   # public.scores
WORKDIR="${SCRIPT_DIR}/workdir"
mkdir -p "$WORKDIR"

# --- STEP 0: preflight -----------------------------------------------------
log "STEP 0: preflight"
for bin in psql pg_dump aws; do command -v "$bin" >/dev/null || abort "'$bin' not found"; done
# pg_dump must be >= the Supabase server major (can't dump a newer server).
srv="$(psql_supabase -tAc "SHOW server_version;" | grep -oE '^[0-9]+')"
cli="$(pg_dump --version | grep -oE '[0-9]+' | head -1)"
(( cli >= srv )) || abort "pg_dump $cli older than Supabase server $srv — upgrade your client"
echo ">> pg_dump $cli >= Supabase server $srv OK"
echo ">> Target: RDS_TARGET_DB=$RDS_TARGET_DB on the instance in RDS_ADMIN_URL"
echo ">> Tables: $TABLES"

# Read-only audit (extensions, RLS roles, FKs into internal schemas). For a
# single public.scores table blockers should be minimal; warn (don't abort) so
# the operator can eyeball it.
log "STEP 0.1: pre-migration audit (00_audit.sh)"
if ! "${SCRIPT_DIR}/00_audit.sh"; then
  echo "!! 00_audit.sh reported potential blockers above. Review them."
  confirm "Audit had findings. Continue anyway?"
fi

# --- STEP 1: RDS snapshot (safety net) -------------------------------------
log "STEP 1: take an RDS snapshot BEFORE touching the instance"
SNAP_ID="${RDS_INSTANCE_ID}-pre-agent-score-$(date -u +%Y%m%d%H%M%S)"
cat <<EOF
   Run this with an AWS identity that has rds:CreateDBSnapshot (the agent's
   profile is read-only). It snapshots the WHOLE instance — fdr/dashboard
   databases are unaffected by anything this script does, but the snapshot is
   the rollback safety net:

     aws --profile <write-profile> --region ${AWS_REGION} rds create-db-snapshot \\
       --db-instance-identifier ${RDS_INSTANCE_ID} \\
       --db-snapshot-identifier ${SNAP_ID}
     aws --profile <write-profile> --region ${AWS_REGION} rds wait \\
       db-snapshot-available --db-snapshot-identifier ${SNAP_ID}
EOF
confirm "Has the RDS snapshot completed (status available)?"

# --- STEP 2: quiesce score-generation jobs ---------------------------------
log "STEP 2: quiesce writers"
cat <<EOF
   Stop everything that writes to the agent-score Supabase scores table:
     - any scheduled generate-scores / rescore-* runs (cron / GitHub Actions),
     - ad-hoc operator script runs,
     - the /api/score endpoint if it's actively scoring (low/no live traffic).
   The window stays open until the Vercel env is repointed in STEP 7.
EOF
confirm "Are all score-generation writers paused?"

# --- STEP 3: ensure target DB + roles + schema -----------------------------
log "STEP 3: ensure agent_score database, RLS roles, and schema on RDS"
ensure_rds_db
ensure_supabase_roles
tbl_count="$(psql_rds -tAc "SELECT count(*) FROM pg_tables WHERE schemaname='public';")"
if [[ "$tbl_count" -eq 0 ]]; then
  sync_schema "$WORKDIR/schema.sql"
else
  echo ">> RDS $RDS_TARGET_DB already has $tbl_count public table(s) — trusting existing schema (data is truncate+restored below)."
fi

# --- STEP 4: dump + restore data (truncate-first, idempotent) --------------
log "STEP 4: dump scores from Supabase and restore into agent_score"
pg_dump "$SUPABASE_URL" --data-only --schema=public --no-owner --no-privileges \
  -f "$WORKDIR/data.sql" || abort "pg_dump failed"
TRUNC="TRUNCATE $(for t in $TABLES; do qident "$t"; printf ','; done | sed 's/,$//') CASCADE;"
{ echo "SET session_replication_role = replica;"
  echo "$TRUNC"
  cat "$WORKDIR/data.sql"
} > "$WORKDIR/restore.sql"
psql_rds -1 -q -f "$WORKDIR/restore.sql" || abort "restore failed (transaction rolled back; rerun is safe)"

# --- STEP 5: routines + sequence bump --------------------------------------
log "STEP 5: re-sync functions/triggers + bump sequences"
"${SCRIPT_DIR}/00_sync_routines.sh" || abort "routine sync failed"
APP_SCHEMAS_SQL="$(echo "$DUMP_SCHEMAS" | sed "s/[^,]*/'&'/g")"
psql_supabase -tA -P pager=off <<SQL > "$WORKDIR/seqsync.sql" || abort "could not read source sequences"
SELECT format('SELECT setval(%L, %s, true);',
              quote_ident(schemaname) || '.' || quote_ident(sequencename), last_value)
FROM pg_sequences
WHERE schemaname IN ($APP_SCHEMAS_SQL) AND last_value IS NOT NULL;
SQL
if [[ -s "$WORKDIR/seqsync.sql" ]]; then
  psql_rds -q -f "$WORKDIR/seqsync.sql" || abort "sequence bump failed"
else
  echo "   (no sequences with values)"
fi

# --- STEP 6: validation gate -----------------------------------------------
log "STEP 6: validation gate (row counts + sampled rows + structure)"
if ! validate_table_set "$TABLES"; then
  abort "validation FAILED — data/structure mismatch (see per-table report above). Nothing has been repointed; investigate and rerun."
fi
echo ">> VALIDATION PASSED."

# --- STEP 6.5: og-images storage copy --------------------------------------
log "STEP 6.5: copy og-images Supabase Storage -> S3 (idempotent)"
echo "   The S3 bucket comes from the agent-score-deploy CDK stack. Copy now:"
echo "       DEPLOY_ENV=${DEPLOY_ENV:-prod} ${SCRIPT_DIR}/migrate-og-images.sh"
confirm "Has migrate-og-images.sh completed (or no images to copy)?"

# --- STEP 7: repoint Vercel + redeploy + promote (NOT AWS) -----------------
log "STEP 7: repoint Vercel env to RDS + S3, then redeploy & promote"
cat <<EOF
   These are VERCEL changes (not AWS). Run them against the fern-agent-score
   project, then promote the new deployment. Set the RDS URL + S3 bucket vars
   and remove the old Supabase vars:

     vercel link --project ${VERCEL_PROJECT} --scope ${VERCEL_TEAM_SLUG}

     # add the new prod env vars (you'll be prompted for each value)
     printf '%s' "<AGENT_SCORE_DATABASE_URL>" | vercel env add AGENT_SCORE_DATABASE_URL production
     printf '%s' "${OG_S3_BUCKET}"           | vercel env add OG_S3_BUCKET production
     printf '%s' "${OG_S3_REGION}"           | vercel env add OG_S3_REGION production

     # remove the retired Supabase vars
     vercel env rm SUPABASE_URL production
     vercel env rm SUPABASE_SECRET_KEY production

     # ship it
     vercel redeploy --prod   # or: vercel deploy --prod
EOF
confirm "Vercel env updated and the new production deployment is live?"

# --- STEP 8: post-cutover validation ---------------------------------------
log "STEP 8: post-cutover checks"
echo "   Run the monitor to confirm reads + score-generation writes land on RDS:"
echo "       DEPLOY_ENV=${DEPLOY_ENV:-prod} ${SCRIPT_DIR}/monitor.sh"
echo ">> Cutover sequence complete. Keep the Supabase project for a rollback"
echo ">> window (see RUNBOOK.md) before decommissioning."
