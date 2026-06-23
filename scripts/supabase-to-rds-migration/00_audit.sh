#!/usr/bin/env bash
# Global, read-only pre-migration audit. Run this FIRST — before schema sync.
#
# It does NOT fix anything and it does NOT assume you need any particular
# handler. Instead it inspects the SOURCE (Supabase) and reports:
#   * BLOCKERS  — things that will make schema restore or logical replication
#                 outright fail. Audit exits non-zero if any are found.
#   * RISKS     — things that exist in the source and won't come across (or
#                 won't behave) automatically. Each only prints if it is
#                 actually present, so you only handle footguns you really have.
# Nothing here mutates either database.
source "$(dirname "$0")/lib.sh"

# Schemas that live only on Supabase and will NOT be migrated.
INTERNAL_SCHEMAS="auth storage vault realtime _realtime _analytics graphql graphql_public supabase_functions pgsodium pgsodium_masks net extensions"
# Extensions that do not exist / are not allowed on stock RDS PostgreSQL.
SUPABASE_ONLY_EXT="pg_graphql pgsodium supabase_vault pgjwt pg_net wrappers pgaudit_to_file"

_sql_list() { local x out=""; for x in $1; do out+="${out:+,}'$x'"; done; echo "$out"; }
INTERNAL_SQL="$(_sql_list "$INTERNAL_SCHEMAS")"
APP_SQL="$(_sql_list "$(echo "$DUMP_SCHEMAS" | tr ',' ' ')")"

blockers=0
risks=0

# Print a BLOCKER section only if the query returns rows. Sets exit failure.
blocker_section() {
  local title="$1" sql="$2" advice="$3" rows
  rows="$(psql_supabase -tA -c "$sql")"
  if [[ -n "$rows" ]]; then
    echo; echo "[BLOCKER] $title"; echo "$rows"; echo "   -> $advice"
    blockers=$((blockers + 1))
  fi
}

# Print a RISK section only if the query returns rows. Advisory only.
risk_section() {
  local title="$1" sql="$2" advice="$3" rows
  rows="$(psql_supabase -tA -c "$sql")"
  if [[ -n "$rows" ]]; then
    echo; echo "[RISK] $title"; echo "$rows" | sed 's/^/   /'; echo "   -> $advice"
    risks=$((risks + 1))
  fi
}

echo "############################################################"
echo "# Auditing source for schemas: [$DUMP_SCHEMAS]"
echo "############################################################"

# ===========================================================================
#  BLOCKERS
# ===========================================================================
fk_rows="$(psql_supabase -tA -c "
  SELECT format('%s.%s -> %s.%s (%s)', cn.nspname, c.relname, fn.nspname, f.relname, con.conname)
  FROM pg_constraint con
  JOIN pg_class c ON c.oid=con.conrelid  JOIN pg_namespace cn ON cn.oid=c.relnamespace
  JOIN pg_class f ON f.oid=con.confrelid JOIN pg_namespace fn ON fn.oid=f.relnamespace
  WHERE con.contype='f' AND cn.nspname IN ($APP_SQL) AND fn.nspname IN ($INTERNAL_SQL);")"
if [[ -n "$fk_rows" ]]; then
  echo; echo "[BLOCKER] Foreign keys into Supabase-only schemas"
  echo "$fk_rows" | sed 's/^/   /'
  echo "   -> Restore fails (referenced table absent). Drop/repoint these FKs or"
  echo "      migrate the referenced data before schema sync."
  blockers=$((blockers + 1))
fi

# Extensions installed on source but unavailable on RDS.
# Extension AVAILABILITY is instance-wide, and the target database (RDS_TARGET_DB)
# usually doesn't exist yet when the audit runs — so query the existing instance's
# maintenance DB via the admin connection rather than RDS_URL.
echo
echo "## Extension availability (Supabase installed vs RDS available)"
echo "   Only extensions whose objects live in, or are USED BY, [$DUMP_SCHEMAS] can"
echo "   block a --schema=$DUMP_SCHEMAS snapshot restore. An extension installed in"
echo "   another schema (e.g. supabase_vault in 'vault') is never emitted by the"
echo "   scoped dump, so it's reported as FYI, not a blocker."
# Is extension $1 actually relevant to the dumped schema(s)? Returns t/f.
# (a) the extension's own objects live in a dumped schema, OR
# (b) some object in a dumped schema (table/index/view, function, type, or a
#     column default) depends on one of the extension's member objects.
ext_in_scope() {
  psql_supabase -tAc "
WITH ext AS (SELECT oid, extnamespace FROM pg_extension WHERE extname='$1'),
members AS (SELECT d.classid, d.objid FROM pg_depend d, ext
            WHERE d.refclassid='pg_extension'::regclass AND d.refobjid=ext.oid AND d.deptype='e')
SELECT (EXISTS (SELECT 1 FROM ext e JOIN pg_namespace n ON n.oid=e.extnamespace WHERE n.nspname IN ($APP_SQL))
     OR EXISTS (SELECT 1 FROM pg_depend d JOIN members m ON m.classid=d.refclassid AND m.objid=d.refobjid
                WHERE d.deptype IN ('n','a') AND (
                   (d.classid='pg_class'::regclass   AND (SELECT n.nspname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.oid=d.objid) IN ($APP_SQL))
                OR (d.classid='pg_proc'::regclass    AND (SELECT n.nspname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE p.oid=d.objid) IN ($APP_SQL))
                OR (d.classid='pg_type'::regclass    AND (SELECT n.nspname FROM pg_type ty JOIN pg_namespace n ON n.oid=ty.typnamespace WHERE ty.oid=d.objid) IN ($APP_SQL))
                OR (d.classid='pg_attrdef'::regclass AND (SELECT n.nspname FROM pg_attrdef ad JOIN pg_class c ON c.oid=ad.adrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE ad.oid=d.objid) IN ($APP_SQL))
                )));"
}
src_ext="$(psql_supabase -tAc "SELECT extname FROM pg_extension WHERE extname<>'plpgsql' ORDER BY extname;")"
while read -r ename; do
  [[ -z "$ename" ]] && continue
  avail="$(psql_rds_admin -tAc "SELECT 1 FROM pg_available_extensions WHERE name='$ename';")"
  if [[ -n "$avail" ]]; then echo "   ok $ename"; continue; fi
  # Unavailable on RDS — only a blocker if the dumped schema(s) actually use it.
  if [[ "$(ext_in_scope "$ename")" == "t" ]]; then
    echo "   [BLOCKER] $ename — unavailable on RDS AND used by [$DUMP_SCHEMAS]."
    echo "             Provide it on RDS, or drop/repoint the dependent objects"
    echo "             before cutover (the schema restore will fail otherwise)."
    blockers=$((blockers + 1))
  else
    local_note="Supabase-only"; echo " $SUPABASE_ONLY_EXT " | grep -q " $ename " || local_note="unavailable on RDS"
    echo "   [FYI] $ename — $local_note, but NO [$DUMP_SCHEMAS] object uses it (its"
    echo "         objects live in another schema). Not emitted by --schema=$DUMP_SCHEMAS;"
    echo "         safe to ignore for this snapshot cutover."
  fi
done <<< "$src_ext"
echo "   note: pg_cron / pg_stat_statements need shared_preload_libraries in the"
echo "         RDS parameter group (reboot) — CREATE EXTENSION alone won't work."

blocker_section \
  "Functions referencing Supabase-only schemas" \
  "SELECT format('function %s.%s', n.nspname, p.proname)
   FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname IN ($APP_SQL)
     AND p.prosrc ~* '(^|[^a-z_])(auth|storage|vault|net|graphql|supabase_functions)\.';" \
  "These fail to create (or silently no-op) on RDS. Rewrite or drop before restore."

# ===========================================================================
#  RISKS  (only printed when actually present in the source)
# ===========================================================================
risk_section \
  "RLS-enabled tables (policies reference roles that don't exist on RDS)" \
  "SELECT format('%s.%s', n.nspname, c.relname)
   FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE c.relkind='r' AND c.relrowsecurity AND n.nspname IN ($APP_SQL);" \
  "anon/authenticated/service_role don't exist on stock RDS. 00_schema_sync.sh
      pre-creates them as NOLOGIN (ensure_supabase_roles) so restore succeeds;
      still decide per table whether RLS should stay enabled on RDS.
      RLS-on + no-policy = silent zero rows."

risk_section \
  "User triggers (verify they are ENABLED on RDS after cutover)" \
  "SELECT format('%s.%s trigger %s (enabled=%s)', n.nspname, c.relname, t.tgname, t.tgenabled)
   FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE NOT t.tgisinternal AND n.nspname IN ($APP_SQL);" \
  "Copied automatically: 00_schema_sync.sh brings them, and 00_sync_routines.sh
      (also run by 04_cutover.sh) re-syncs them idempotently before the gate.
      They do NOT fire for replicated rows (good), but DO fire for live RDS
      writes post-cutover — confirm tgenabled. Don't rely on a trigger to
      regenerate data that should have been replicated."

risk_section \
  "Custom types / enums / domains (must exist on target before data; freeze DDL)" \
  "SELECT format('%s.%s (%s)', n.nspname, t.typname,
      CASE t.typtype WHEN 'e' THEN 'enum' WHEN 'd' THEN 'domain'
                     WHEN 'c' THEN 'composite' WHEN 'r' THEN 'range' END)
   FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
   WHERE n.nspname IN ($APP_SQL) AND t.typtype IN ('e','d','c','r')
     AND (t.typtype<>'c' OR EXISTS (SELECT 1 FROM pg_class c WHERE c.oid=t.typrelid AND c.relkind='c'));" \
  "Schema sync creates these, but adding an enum value on Supabase mid-flight
      breaks the subscriber. Freeze type/enum DDL for the migration window."

risk_section \
  "Materialized views (arrive empty; must REFRESH on RDS after cutover)" \
  "SELECT format('%s.%s', n.nspname, c.relname)
   FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE c.relkind='m' AND n.nspname IN ($APP_SQL);" \
  "Logical replication carries no matview data. REFRESH after the owning cluster
      cuts over (04 already reminds you)."

risk_section \
  "Partitioned tables (need publish_via_partition_root handling)" \
  "SELECT format('%s.%s', n.nspname, c.relname)
   FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE c.relkind='p' AND n.nspname IN ($APP_SQL);" \
  "Publish via the partition root (publish_via_partition_root=true) or partitions
      replicate inconsistently. Verify your publication/cluster setup."

risk_section \
  "Unlogged tables (NOT replicated by logical replication)" \
  "SELECT format('%s.%s', n.nspname, c.relname)
   FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE c.relkind='r' AND c.relpersistence='u' AND n.nspname IN ($APP_SQL);" \
  "Unlogged tables produce no WAL → no replication. Copy separately if the data
      matters, or accept they start empty on RDS."

risk_section \
  "Generated columns (recomputed on subscriber, not copied)" \
  "SELECT format('%s.%s.%s', n.nspname, c.relname, a.attname)
   FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE a.attgenerated<>'' AND a.attnum>0 AND NOT a.attisdropped AND n.nspname IN ($APP_SQL);" \
  "Fine as long as the generation expression's functions exist on RDS — just be
      aware values are recomputed, not streamed."

risk_section \
  "Identity columns + sequences NOT owned by a column (FYI; cutover now bumps these)" \
  "SELECT format('IDENTITY %s.%s.%s', table_schema, table_name, column_name)
   FROM information_schema.columns
   WHERE is_identity='YES' AND table_schema IN ($APP_SQL)
   UNION ALL
   SELECT format('UNOWNED SEQUENCE %s.%s', n.nspname, s.relname)
   FROM pg_class s JOIN pg_namespace n ON n.oid=s.relnamespace
   WHERE s.relkind='S' AND n.nspname IN ($APP_SQL)
     AND NOT EXISTS (SELECT 1 FROM pg_depend d
                     WHERE d.objid=s.oid AND d.deptype='a' AND d.classid='pg_class'::regclass);" \
  "04_cutover bumps EVERY sequence in DUMP_SCHEMAS (owned, identity AND unowned)
      via pg_sequences, so these are handled automatically. Listed for awareness."

risk_section \
  "Foreign servers / FDW user mappings (not migrated)" \
  "SELECT format('server %s (fdw %s)', s.srvname, w.fdwname)
   FROM pg_foreign_server s JOIN pg_foreign_data_wrapper w ON w.oid=s.srvfdw;" \
  "Recreate foreign servers + user mappings on RDS, and confirm the FDW is
      available there (postgres_fdw is; many others are not)."

risk_section \
  "Event triggers (global; not migrated)" \
  "SELECT format('%s on %s', evtname, evtevent) FROM pg_event_trigger;" \
  "Recreate any event triggers you depend on, on RDS."

# pg_cron jobs (cron schema may not exist)
if [[ -n "$(psql_supabase -tAc "SELECT to_regclass('cron.job');")" ]]; then
  cron_jobs="$(psql_supabase -tAc "SELECT format('%s: %s', jobname, schedule) FROM cron.job;" 2>/dev/null || true)"
  if [[ -n "$cron_jobs" ]]; then
    echo; echo "[RISK] pg_cron scheduled jobs (do not migrate)"
    echo "$cron_jobs" | sed 's/^/   /'
    echo "   -> Recreate these on RDS (and enable pg_cron via parameter group)."
    risks=$((risks + 1))
  fi
fi

# Large objects (pg_largeobject is NOT replicated logically)
lo_count="$(psql_supabase -tAc "SELECT count(*) FROM pg_largeobject_metadata;" 2>/dev/null || echo 0)"
if [[ "${lo_count:-0}" -gt 0 ]]; then
  echo; echo "[RISK] Large objects present ($lo_count)"
  echo "   -> Logical replication does NOT carry large objects (lo/oid blobs)."
  echo "      Copy them separately (pg_dump -b) if anything uses them."
  risks=$((risks + 1))
fi

# ===========================================================================
echo
echo "############################################################"
echo "# Audit summary: $blockers blocker(s), $risks risk(s)"
echo "############################################################"
if [[ "$risks" -gt 0 ]]; then
  echo "Risks are not auto-fatal, but each is something that won't come across"
  echo "(or won't behave) on its own. Decide how to handle each before cutover."
fi
if [[ "$blockers" -gt 0 ]]; then
  echo "BLOCKERS must be resolved before 00_schema_sync.sh. Exiting non-zero."
  exit 1
fi
echo "No blockers. Proceed to 00_schema_sync.sh (after handling any risks above)."
