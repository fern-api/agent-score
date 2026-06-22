#!/usr/bin/env bash
# ===========================================================================
# monitor.sh — post-cutover health check for agent-score on RDS (FER-11415).
# Read-only. Confirms public reads + score-generation writes land on the
# agent_score database.
#
#   DEPLOY_ENV=prod ./monitor.sh
#
# Checks:
#   1. RDS reachable + scores row count + newest scored_at (freshness).
#   2. A small sample of top rows.
#   3. (optional) the public site responds and serves leaderboard data.
# ===========================================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "${SCRIPT_DIR}/lib.sh"

echo "=== agent-score RDS monitor ($RDS_TARGET_DB) ==="

echo
echo "-- row count + freshness --"
psql_rds -P pager=off -c "
  SELECT count(*)                                   AS total_rows,
         count(*) FILTER (WHERE hidden = false)     AS visible_rows,
         max(scored_at)                             AS newest_scored_at,
         round(extract(epoch FROM (now() - max(scored_at)))/3600.0, 1) AS hours_since_newest
  FROM public.scores;"

echo "-- top 5 by score --"
psql_rds -P pager=off -c "
  SELECT slug, score, grade, scored_at
  FROM public.scores
  WHERE hidden = false
  ORDER BY score DESC
  LIMIT 5;"

echo "-- rows scored in the last 24h (recent write activity) --"
psql_rds -P pager=off -c "
  SELECT count(*) AS scored_last_24h
  FROM public.scores
  WHERE scored_at > now() - interval '24 hours';"

# Optional public-read smoke test against the live site.
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://agentscore.fern.dev}"
echo
echo "-- public read smoke test ($SITE_URL) --"
if command -v curl >/dev/null; then
  code="$(curl -s -o /dev/null -w '%{http_code}' "$SITE_URL" || echo 000)"
  echo "GET $SITE_URL -> HTTP $code"
  [[ "$code" == "200" ]] && echo "OK: public site responds." || echo "!! non-200; investigate the deployment."
else
  echo "(curl not installed; skipping public smoke test)"
fi

echo
echo "=== monitor complete ==="
