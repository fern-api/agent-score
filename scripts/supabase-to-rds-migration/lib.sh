# shellcheck shell=bash
set -euo pipefail
# These scripts use associative arrays (declare -A CLUSTERS) — bash 4+ only.
# macOS ships bash 3.2; run on Linux or `brew install bash`.
if (( BASH_VERSINFO[0] < 4 )); then
  echo "ERROR: bash 4+ required (you have $BASH_VERSION). On macOS: brew install bash." >&2
  exit 1
fi
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# ---------------------------------------------------------------------------
# Per-environment config selection. Run with DEPLOY_ENV=local|dev|prod, e.g.
#   DEPLOY_ENV=dev ./04_cutover.sh
# Each env has its own gitignored config.<env>.sh (DB URLs + flag-store creds +
# the cutover hooks), templated by config.<env>.sh.example. For backward compat
# a bare config.sh is used when DEPLOY_ENV is unset.
# ---------------------------------------------------------------------------
if [[ -n "${DEPLOY_ENV:-}" ]]; then
  case "$DEPLOY_ENV" in
    local|dev|prod) ;;
    *) echo "ERROR: DEPLOY_ENV must be one of local|dev|prod (got '$DEPLOY_ENV')." >&2; exit 2 ;;
  esac
  CONFIG_FILE="${SCRIPT_DIR}/config.${DEPLOY_ENV}.sh"
elif [[ -f "${SCRIPT_DIR}/config.sh" ]]; then
  CONFIG_FILE="${SCRIPT_DIR}/config.sh"
else
  echo "ERROR: set DEPLOY_ENV=local|dev|prod (no config.<env>.sh selected and no legacy config.sh present)." >&2
  exit 2
fi
if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "ERROR: $CONFIG_FILE not found. Copy ${CONFIG_FILE}.example to $(basename "$CONFIG_FILE") and fill it in." >&2
  exit 2
fi
# shellcheck source=config.dev.sh
source "$CONFIG_FILE"

# ---------------------------------------------------------------------------
# SAFETY: the migration target must be a NEW, throwaway database inside the
# existing instance — never a shared/production database. FDR's production data
# lives in the `postgres` and `fdr` databases, and the instance also ships
# internal databases (template0/template1/rdsadmin). Refuse to target any of
# them so a misconfig (or a copy-paste of the admin URL into RDS_URL) can't
# import on top of prod.
# fiddle + nursery are live dev services sharing the fern-dev2 instance.
# `dashboard` is the live fern-dashboard namespace on fern-prod-enc (FER-10818)
# — agent-score must NOT touch it.
RESERVED_DBS="postgres fdr dashboard fiddle nursery template0 template1 rdsadmin"

# Extract the dbname from a postgres:// URL: strip query string, take last path
# segment. e.g. ...:5432/WORKING_NAME?sslmode=require -> WORKING_NAME
url_dbname() { local u="${1%%\?*}"; echo "${u##*/}"; }

assert_safe_rds_target() {
  local db rds_db r
  db="${RDS_TARGET_DB:?RDS_TARGET_DB not set in config.sh}"
  rds_db="$(url_dbname "${RDS_URL:?RDS_URL not set in config.sh}")"
  for r in $RESERVED_DBS; do
    if [[ "${db,,}" == "$r" ]]; then
      echo "FATAL: RDS_TARGET_DB='$db' is a reserved/production database (FDR prod lives in 'postgres' and 'fdr')." >&2
      echo "       Point the migration at a NEW database name (e.g. WORKING_NAME)." >&2
      exit 2
    fi
    if [[ "${rds_db,,}" == "$r" ]]; then
      echo "FATAL: RDS_URL targets the '$rds_db' database — that is reserved/production (FDR prod lives in 'postgres' and 'fdr')." >&2
      echo "       RDS_URL must point at the new RDS_TARGET_DB, not the maintenance/prod DB." >&2
      exit 2
    fi
  done
  # RDS_URL must actually point at the target database, not somewhere else.
  if [[ "${rds_db,,}" != "${db,,}" ]]; then
    echo "FATAL: RDS_URL dbname ('$rds_db') does not match RDS_TARGET_DB ('$db')." >&2
    echo "       They must be the same new database; only the dbname differs from RDS_ADMIN_URL." >&2
    exit 2
  fi
}
assert_safe_rds_target

pub_name()  { echo "pub_$1"; }
sub_name()  { echo "sub_$1"; }
slot_name() { echo "slot_$1"; }

require_cluster() {
  [[ -n "${1:-}" ]]            || { echo "usage: $(basename "$0") <cluster>"; exit 2; }
  [[ -n "${CLUSTERS[$1]:-}" ]] || { echo "unknown cluster: $1"; exit 2; }
}

# space-separated list, exactly as defined in config
cluster_tables() { echo "${CLUSTERS[$1]}"; }

# Quote a schema-qualified name as "schema"."name" so mixed-case identifiers
# (Prisma PascalCase: "User", "Organization", "AnalyticsRecord") aren't folded
# to lowercase when interpolated into SQL as an identifier. Splits on the FIRST
# dot (schema.name); lowercase/snake_case names quote harmlessly.
qident() { local x="$1"; printf '"%s"."%s"' "${x%%.*}" "${x#*.}"; }

# 'public."a", public."b"' for CREATE PUBLICATION ... FOR TABLE (quoted idents)
cluster_tables_csv() {
  local t out=""
  for t in $(cluster_tables "$1"); do out+="${out:+, }$(qident "$t")"; done
  echo "$out"
}

# "public.a,public.b" for SQL array building
cluster_tables_commalist() { cluster_tables_csv "$1" | tr -d ' '; }

psql_supabase()  { psql "$SUPABASE_URL"   -v ON_ERROR_STOP=1 "$@"; }
psql_rds()       { psql "$RDS_URL"        -v ON_ERROR_STOP=1 "$@"; }
# Connection to the EXISTING instance's maintenance DB (e.g. postgres). Used for
# CREATE DATABASE and for instance-wide checks (pg_available_extensions) that
# must run before RDS_TARGET_DB exists.
psql_rds_admin() { psql "$RDS_ADMIN_URL"  -v ON_ERROR_STOP=1 "$@"; }

# Create RDS_TARGET_DB inside the existing instance if it isn't there yet.
# CREATE DATABASE cannot run in a transaction or with IF NOT EXISTS, so we guard
# it with an existence check. Safe to call repeatedly.
ensure_rds_db() {
  local db="${RDS_TARGET_DB:?RDS_TARGET_DB not set in config.sh}"
  if [[ "$db" =~ [^A-Za-z0-9_] ]]; then
    echo "ERROR: RDS_TARGET_DB='$db' must be a plain identifier (A-Z a-z 0-9 _)." >&2
    exit 2
  fi
  assert_safe_rds_target  # never CREATE/import onto postgres or another reserved DB
  if [[ -n "$(psql_rds_admin -tAc "SELECT 1 FROM pg_database WHERE datname='$db';")" ]]; then
    echo ">> RDS database '$db' already exists on the instance — reusing it."
  else
    echo ">> Creating new database '$db' on the existing RDS instance"
    psql_rds_admin -c "CREATE DATABASE \"$db\";"
  fi
}

# Pre-create the Supabase RLS roles on the target instance as NOLOGIN roles.
# Supabase RLS policies reference anon/authenticated/service_role; the schema
# restore fails (and RLS-enabled tables silently return zero rows) if they
# don't exist on the target. Roles are instance-wide, so this uses the admin
# connection and is safe to call repeatedly.
ensure_supabase_roles() {
  local r
  for r in anon authenticated service_role; do
    if [[ -n "$(psql_rds_admin -tAc "SELECT 1 FROM pg_roles WHERE rolname='$r';")" ]]; then
      echo ">> Role '$r' already exists on target."
    else
      echo ">> Creating NOLOGIN role '$r' on target (referenced by Supabase RLS policies)"
      psql_rds_admin -c "CREATE ROLE \"$r\" NOLOGIN;"
    fi
  done
}

# ---------------------------------------------------------------------------
# Dump schema-only (tables, indexes, constraints, sequences, views, functions,
# triggers) from Supabase and restore it into RDS_TARGET_DB. Call ensure_rds_db
# and ensure_supabase_roles first (this restores INTO the target DB and the
# restored RLS policies reference the Supabase roles).
#
# The restore is NOT object-level idempotent: under ON_ERROR_STOP=1 a second
# run fails because the tables already exist. Callers decide when to run it:
#   - 00_schema_sync.sh runs it as the one-time bootstrap.
#   - cutover.sh runs it only when the target has no public tables (a fresh or
#     freshly-dropped DB), and trusts an existing schema otherwise — the
#     cutover re-syncs routines and truncate+restores data on every run anyway.
#
# $1 = path to write the dumped+rewritten schema SQL (e.g. "$WORKDIR/schema.sql").
# Honors DUMP_SCHEMAS. Rewrites the dump so the restore runs unattended:
#   - strip PG17+ `SET transaction_timeout` (unknown GUC on <PG17 targets)
#   - CREATE SCHEMA / CREATE EXTENSION -> IF NOT EXISTS (target already has the
#     public schema and any RDS-managed extensions)
#   - drop known Supabase-only extensions RDS rejects. With DUMP_SCHEMAS=public
#     these live in the `extensions` schema and never appear, but a wider
#     DUMP_SCHEMAS could pull them in — strip them so prod never blocks on a
#     human review prompt.
sync_schema() {
  local out="${1:?sync_schema: output path required}"
  local schema_args=() s _schemas
  IFS=',' read -ra _schemas <<< "$DUMP_SCHEMAS"
  for s in "${_schemas[@]}"; do schema_args+=(--schema="$s"); done

  echo ">> Dumping schema-only from Supabase (schemas: $DUMP_SCHEMAS)"
  pg_dump "$SUPABASE_URL" \
    --schema-only --no-owner --no-privileges \
    --no-publications --no-subscriptions \
    "${schema_args[@]}" -f "$out"

  echo ">> Rewriting $(basename "$out") for unattended target restore"
  sed -i.bak \
    -e '/^SET transaction_timeout/d' \
    -e '/IF NOT EXISTS/!s/^CREATE SCHEMA \([^;]*\);$/CREATE SCHEMA IF NOT EXISTS \1;/' \
    -e '/IF NOT EXISTS/!s/^CREATE EXTENSION \(.*\);$/CREATE EXTENSION IF NOT EXISTS \1;/' \
    -e '/^CREATE EXTENSION IF NOT EXISTS "\?\(pg_graphql\|pgsodium\|supabase_vault\|pg_net\|pgjwt\)"\?/d' \
    "$out"
  rm -f "$out.bak"

  echo ">> Restoring schema into RDS ($RDS_TARGET_DB)"
  psql_rds -f "$out"
  echo ">> Schema restore complete (includes functions + triggers from the dump)."
}

# ---------------------------------------------------------------------------
# Global helpers (cutover flips the WHOLE database at once, not per-cluster).
# Clusters remain the unit of *replication setup*; cutover operates over all.
# ---------------------------------------------------------------------------
all_clusters() { echo "${!CLUSTERS[@]}"; }

# All distinct tables across every cluster, space-separated.
all_tables() {
  local c t; declare -A seen=()
  for c in "${!CLUSTERS[@]}"; do
    for t in ${CLUSTERS[$c]}; do
      if [[ -z "${seen[$t]:-}" ]]; then echo "$t"; seen[$t]=1; fi
    done
  done
}
all_tables_commalist() { all_tables | paste -sd, -; }

# Run a config hook command if set, else fall back to an interactive prompt so
# the operator never has to remember the order. $1=hook var name, $2=prompt.
run_or_prompt() {
  local hook="${!1:-}" prompt="$2"
  if [[ -n "$hook" ]]; then echo ">> ($1) $hook"; bash -c "$hook";
  else read -r -p ">> $prompt, then Enter... " _; fi
}

# ---------------------------------------------------------------------------
# Idempotently copy all user-defined FUNCTIONS/PROCEDURES and TRIGGERS for the
# app schema(s) from Supabase -> RDS. Logical replication carries row data only,
# not routines or triggers; the one-time schema sync brings them initially, and
# this re-applies them so any function/trigger added or changed on Supabase
# after that sync is reflected on RDS before cutover.
#
# Idempotent: functions come back as CREATE OR REPLACE; each trigger is emitted
# as DROP TRIGGER IF EXISTS + CREATE TRIGGER (CREATE TRIGGER has no OR REPLACE
# before PG14). check_function_bodies=false so routines install regardless of
# creation order or body references, exactly like a pg_dump restore. Triggers
# created here fire for LOCAL writes only, not for logical-replication apply
# (default "origin" mode) — so they won't double-process replicated rows, but
# will fire for live writes after cutover.
#
# Requires the target tables to already exist on RDS (run 00_schema_sync first).
# Extension-owned routines are skipped (the extension provides them on RDS).
sync_functions_triggers() {
  local APP_SQL fns trgs out
  APP_SQL="$(echo "$DUMP_SCHEMAS" | sed "s/[^,]*/'&'/g")"   # public -> 'public'
  out="${SCRIPT_DIR}/routines.sql"

  echo ">> Extracting functions/procedures from Supabase [$DUMP_SCHEMAS]"
  fns="$(psql_supabase -tA <<SQL
SELECT string_agg(pg_get_functiondef(p.oid) || E';\n', E'\n' ORDER BY n.nspname, p.proname)
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname IN ($APP_SQL)
  AND p.prokind IN ('f','p')                       -- functions + procedures only
  AND NOT EXISTS (SELECT 1 FROM pg_depend d         -- skip extension-owned routines
                  WHERE d.objid = p.oid AND d.deptype = 'e');
SQL
)"

  echo ">> Extracting triggers from Supabase [$DUMP_SCHEMAS]"
  trgs="$(psql_supabase -tA <<SQL
SELECT string_agg(
         format('DROP TRIGGER IF EXISTS %I ON %I.%I;', t.tgname, n.nspname, c.relname)
         || E'\n' || pg_get_triggerdef(t.oid) || E';\n',
         E'\n' ORDER BY n.nspname, c.relname, t.tgname)
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE NOT t.tgisinternal                            -- skip internal/constraint triggers
  AND n.nspname IN ($APP_SQL);
SQL
)"

  if [[ -z "${fns//[[:space:]]/}" && -z "${trgs//[[:space:]]/}" ]]; then
    echo ">> No user functions or triggers in [$DUMP_SCHEMAS]. Nothing to copy."
    return 0
  fi

  {
    echo "-- Generated by sync_functions_triggers(); safe to re-apply (idempotent)."
    echo "SET check_function_bodies = false;"
    echo "BEGIN;"
    [[ -n "${fns//[[:space:]]/}" ]]  && printf '%s\n' "$fns"   # functions first (triggers reference them)
    [[ -n "${trgs//[[:space:]]/}" ]] && printf '%s\n' "$trgs"
    echo "COMMIT;"
  } > "$out"

  echo ">> Applying $out to RDS (functions + triggers, single transaction)"
  psql_rds -f "$out"
  echo ">> Functions/procedures and triggers synced to RDS."
}

# Primary-key columns of a schema-qualified table: "a,b" or empty.
pk_cols() {
  psql_supabase -tAc "
    SELECT string_agg(a.attname, ',' ORDER BY k.ord)
    FROM pg_index i
    JOIN pg_class c ON c.oid=i.indrelid
    JOIN pg_namespace n ON n.oid=c.relnamespace
    CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum, ord)
    JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum=k.attnum
    WHERE i.indisprimary AND n.nspname='${1%%.*}' AND c.relname='${1##*.}';" 2>/dev/null
}

# Sum of write counters (ins+upd+del) across the given tables on a given DB.
# Used to confirm app writes have actually stopped / are flowing.
write_counter() {
  local which="$1"; shift
  local list; list="$(echo "$*" | sed "s/[^ ]*/'&'/g; s/ /,/g")"
  local q="SELECT COALESCE(sum(n_tup_ins+n_tup_upd+n_tup_del),0)
           FROM pg_stat_user_tables
           WHERE (schemaname||'.'||relname) IN ($list);"
  if [[ "$which" == "source" ]]; then psql_supabase -tAc "$q"; else psql_rds -tAc "$q"; fi
}

# Lightweight validation of a table set (counts + sampled rows + structure).
# Returns 0 if everything matches, 1 otherwise. Prints a per-table report.
# Honors SAMPLE_ROWS (default 5).
validate_table_set() {
  local tables="$1" t pk s_cnt r_cnt s_h r_h s_st r_st sql fail=0
  local SAMPLE="${SAMPLE_ROWS:-5}"
  local PRE="SET extra_float_digits=3; SET DateStyle='ISO, MDY'; SET timezone='UTC'; SET bytea_output='hex';"
  for t in $tables; do
    echo "   --- $t"
    local qt; qt="$(qident "$t")"
    s_cnt="$(psql_supabase -tAc "SELECT count(*) FROM $qt;")"
    r_cnt="$(psql_rds      -tAc "SELECT count(*) FROM $qt;")"
    if [[ "$s_cnt" == "$r_cnt" ]]; then echo "       rows: $s_cnt (match)";
    else echo "       rows: supabase=$s_cnt rds=$r_cnt  !! MISMATCH"; fail=1; fi

    pk="$(pk_cols "$t")"
    if [[ -z "$pk" ]]; then echo "       sample: (no PK, skipped)";
    else
      # For composite PKs the direction must apply to every column:
      # "a,b" -> "a DESC, b DESC" (otherwise only the last column inverts and
      # we wouldn't actually sample the newest N rows). ASC is the default,
      # so the ascending branch can use $pk verbatim.
      # Quote each PK column too (mixed-case columns fold otherwise), and apply
      # DESC to every column for the newest-N sample.
      local _c pk_asc="" pk_desc=""
      IFS=',' read -ra _pkcols <<< "$pk"
      for _c in "${_pkcols[@]}"; do
        pk_asc+="${pk_asc:+, }\"$_c\""
        pk_desc+="${pk_desc:+, }\"$_c\" DESC"
      done
      # string_agg has an explicit ORDER BY so the digest is independent of
      # the (unspecified) order rows come back from the UNION ALL — without
      # it Supabase vs RDS planner differences could yield a spurious
      # !! MISMATCH and abort the cutover at the validation gate.
      sql="$PRE SELECT md5(string_agg(h,'' ORDER BY h)) FROM (
            (SELECT md5(x.*::text) h FROM $qt x ORDER BY $pk_desc LIMIT $SAMPLE)
            UNION ALL
            (SELECT md5(x.*::text) h FROM $qt x ORDER BY $pk_asc  LIMIT $SAMPLE)) s;"
      s_h="$(psql_supabase -tAc "$sql")"; r_h="$(psql_rds -tAc "$sql")"
      if [[ "$s_h" == "$r_h" ]]; then echo "       sample: ${SAMPLE}+${SAMPLE} by $pk (match)";
      else echo "       sample: !! MISMATCH by $pk"; fail=1; fi
    fi

    # contype<>'n': PG18 materializes NOT NULL constraints as pg_constraint
    # rows; PG17 and earlier don't. The real migration is PG17 (Supabase) →
    # PG18.3 (RDS), so counting them would flag every table as a structure
    # mismatch and abort the gate. NOT NULL parity is already covered by the
    # schema restore; exclude them from the count on both sides.
    sql="SELECT format('idx=%s con=%s trg=%s rls=%s',
      (SELECT count(*) FROM pg_index WHERE indrelid='$qt'::regclass),
      (SELECT count(*) FROM pg_constraint WHERE conrelid='$qt'::regclass AND contype<>'n'),
      (SELECT count(*) FROM pg_trigger WHERE tgrelid='$qt'::regclass AND NOT tgisinternal),
      (SELECT relrowsecurity FROM pg_class WHERE oid='$qt'::regclass));"
    s_st="$(psql_supabase -tAc "$sql")"; r_st="$(psql_rds -tAc "$sql")"
    if [[ "$s_st" == "$r_st" ]]; then echo "       structure: $s_st (match)";
    else echo "       structure: src[$s_st] rds[$r_st]  !! MISMATCH"; fail=1; fi
  done
  return $fail
}
