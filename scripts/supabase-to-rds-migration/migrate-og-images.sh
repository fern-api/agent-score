#!/usr/bin/env bash
# ===========================================================================
# migrate-og-images.sh — copy the agent-score Supabase Storage `og-images`
# bucket verbatim into the S3 bucket created by the agent-score-deploy CDK
# stack (FER-11415).
#
#   DEPLOY_ENV=prod ./migrate-og-images.sh            # copy everything
#   DEPLOY_ENV=prod ./migrate-og-images.sh --dry-run  # list only, no upload
#
# Idempotent: every object is re-uploaded with its ORIGINAL name (<slug>.png)
# and image/png content-type, overwriting any existing copy. The bucket is
# small and changes rarely, so re-running has no penalty. Storage data does
# NOT come across a pg_dump, which is why this exists separately from cutover.
#
# Needs (from config.<env>.sh): SUPABASE_PROJECT_URL, SUPABASE_SECRET_KEY,
# SUPABASE_OG_BUCKET, OG_S3_BUCKET, OG_S3_REGION, AWS_PROFILE.
# ===========================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ENV="${DEPLOY_ENV:-prod}"
CONFIG_FILE="${SCRIPT_DIR}/config.${DEPLOY_ENV}.sh"
if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "ERROR: $CONFIG_FILE not found. Copy config.${DEPLOY_ENV}.sh.example and fill it in." >&2
  exit 2
fi
# shellcheck source=config.prod.sh disable=SC1090
source "$CONFIG_FILE"

DRY_RUN=0
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=1

: "${SUPABASE_PROJECT_URL:?set in config}"
: "${SUPABASE_SECRET_KEY:?set in config}"
: "${SUPABASE_OG_BUCKET:?set in config}"
: "${OG_S3_BUCKET:?set in config}"
: "${OG_S3_REGION:?set in config}"
AWS_PROFILE="${AWS_PROFILE:-fern}"

for bin in curl jq aws; do
  command -v "$bin" >/dev/null || { echo "ERROR: '$bin' is required." >&2; exit 2; }
done

api="${SUPABASE_PROJECT_URL%/}/storage/v1"
auth=(-H "apikey: ${SUPABASE_SECRET_KEY}" -H "Authorization: Bearer ${SUPABASE_SECRET_KEY}")
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo ">> Listing objects in Supabase Storage bucket '${SUPABASE_OG_BUCKET}'"
# Storage 'list' is paginated; page through with offset until a short page.
offset=0; limit=100; total=0; copied=0
while :; do
  page="$(curl -fsS -X POST "${api}/object/list/${SUPABASE_OG_BUCKET}" \
    "${auth[@]}" -H "Content-Type: application/json" \
    -d "{\"prefix\":\"\",\"limit\":${limit},\"offset\":${offset},\"sortBy\":{\"column\":\"name\",\"order\":\"asc\"}}")"
  count="$(echo "$page" | jq 'length')"
  [[ "$count" -eq 0 ]] && break

  # Only real files (id != null); skip pseudo-folder rows.
  mapfile -t names < <(echo "$page" | jq -r '.[] | select(.id != null) | .name')
  for name in "${names[@]}"; do
    [[ -z "$name" ]] && continue
    total=$((total+1))
    if [[ "$DRY_RUN" -eq 1 ]]; then
      echo "   [dry-run] would copy ${name} -> s3://${OG_S3_BUCKET}/${name}"
      continue
    fi
    # Download (authenticated; works for public or private buckets).
    curl -fsS "${api}/object/${SUPABASE_OG_BUCKET}/${name}" "${auth[@]}" -o "${tmp}/obj"
    ctype="image/png"; [[ "$name" == *.jpg || "$name" == *.jpeg ]] && ctype="image/jpeg"
    aws --profile "$AWS_PROFILE" --region "$OG_S3_REGION" \
      s3 cp "${tmp}/obj" "s3://${OG_S3_BUCKET}/${name}" \
      --content-type "$ctype" --only-show-errors
    echo "   copied ${name} -> s3://${OG_S3_BUCKET}/${name}"
    copied=$((copied+1))
  done

  [[ "$count" -lt "$limit" ]] && break
  offset=$((offset+limit))
done

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo ">> Dry run complete. ${total} object(s) would be copied."
else
  echo ">> Done. Copied ${copied}/${total} object(s) to s3://${OG_S3_BUCKET}."
fi
