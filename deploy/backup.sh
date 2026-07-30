#!/usr/bin/env bash
# Nightly Postgres backup -> S3. Installed on the app host and run by cron.
#
# Uses the EC2 instance role for S3, so there are no credentials on disk.
# Local copies are pruned after 7 days; S3 keeps everything (the bucket is
# versioned, and lifecycle rules can expire old prefixes if it grows).
set -euo pipefail

BUCKET="${BACKUP_BUCKET:-yunto-uploads-082988010852}"
REGION="${AWS_REGION:-ap-south-1}"
DIR="$HOME/app/deploy"
OUT="/tmp/yunto-$(date -u +%Y%m%dT%H%M%SZ).dump"

cd "$DIR"

# -Fc = custom format: compressed and restorable with pg_restore.
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U "${POSTGRES_USER:-yunto}" -d "${POSTGRES_DB:-yunto}" -Fc > "$OUT"

# A dump that is suspiciously small usually means the container answered but the
# database was empty or mid-restart. Refuse to ship it over a good one.
SIZE=$(wc -c < "$OUT")
if [ "$SIZE" -lt 10000 ]; then
  echo "backup aborted: dump is only ${SIZE}B, refusing to upload" >&2
  rm -f "$OUT"
  exit 1
fi

aws s3 cp "$OUT" "s3://$BUCKET/backups/$(basename "$OUT")" --region "$REGION"
echo "uploaded $(basename "$OUT") (${SIZE}B)"

find /tmp -maxdepth 1 -name 'yunto-*.dump' -mtime +7 -delete 2>/dev/null || true
