#!/usr/bin/env bash
# Refresh ALL materialized views on RDS. Logical replication carries no matview
# data, so they arrive empty (WITH NO DATA) from the schema sync.
#
# This is the "dumb" version: it refreshes every matview in the app schema(s),
# in no particular cluster order. A matview that reads tables from more than one
# cluster is only correct once ALL of those clusters are on RDS — so run this
# AFTER the entire migration is complete, not mid-way through a staged cutover.
# Running it early just yields half-stale results with no error.
#
# Plain REFRESH (not CONCURRENTLY) because matviews start unpopulated and
# CONCURRENTLY requires an already-populated matview with a unique index.
source "$(dirname "$0")/lib.sh"

APP_SQL="$(echo "$DUMP_SCHEMAS" | sed "s/[^,]*/'&'/g")"  # public -> 'public'

mapfile -t MVS < <(psql_rds -tAc "
  SELECT format('%I.%I', schemaname, matviewname)
  FROM pg_matviews
  WHERE schemaname IN ($APP_SQL)
  ORDER BY schemaname, matviewname;")

if [[ "${#MVS[@]}" -eq 0 ]]; then
  echo ">> No materialized views in [$DUMP_SCHEMAS] on RDS. Nothing to do."
  exit 0
fi

echo ">> Refreshing ${#MVS[@]} materialized view(s) on RDS:"
fail=0
for mv in "${MVS[@]}"; do
  printf '   %-50s ' "$mv"
  start=$(date +%s)
  if psql_rds -qc "REFRESH MATERIALIZED VIEW $mv;" >/dev/null 2>&1; then
    echo "ok ($(( $(date +%s) - start ))s)"
  else
    echo "FAILED"
    # Surface the real error without aborting the whole batch.
    psql_rds -c "REFRESH MATERIALIZED VIEW $mv;" 2>&1 | sed 's/^/      /' || true
    fail=1
  fi
done

if [[ "$fail" -ne 0 ]]; then
  echo ">> One or more refreshes FAILED (often a dependency-order issue: refresh"
  echo "   the matviews those depend on first, then re-run). Exiting non-zero."
  exit 1
fi
echo ">> All materialized views refreshed."
