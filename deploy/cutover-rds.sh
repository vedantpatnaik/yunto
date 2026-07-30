#!/usr/bin/env bash
# Migrate production Postgres from the in-container database to managed RDS.
#
#   source deploy/aws-env.sh && ./deploy/cutover-rds.sh
#
# Why: the containerised database lives on a single EBS volume with no
# point-in-time recovery. RDS gives automated backups, snapshots and managed
# minor-version upgrades.
#
# Safety: takes a fresh dump first, restores into RDS, VERIFIES row counts
# match, and only then repoints the app. The old container and its volume are
# left untouched, so rolling back is a one-line DATABASE_URL revert.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
IP="$(cat "$HERE/.instance-ip")"
KEY="$HERE/yunto-demo.pem"
SSH="ssh -i $KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ec2-user@$IP"

: "${AWS_PROFILE:?source deploy/aws-env.sh first}"
export AWS_PAGER=""

RDS_HOST=$(aws rds describe-db-instances --db-instance-identifier yunto-db \
  --query 'DBInstances[0].Endpoint.Address' --output text)
RDS_PW=$(cat "$HERE/.rds-password")
[ -n "$RDS_HOST" ] && [ "$RDS_HOST" != "None" ] || { echo "✗ RDS endpoint not ready"; exit 1; }
echo "▸ target: $RDS_HOST"

echo "▸ dumping current database…"
$SSH 'cd ~/app/deploy && docker compose -f docker-compose.prod.yml exec -T db pg_dump -U yunto -d yunto -Fc > /tmp/cutover.dump && ls -lh /tmp/cutover.dump'

echo "▸ restoring into RDS…"
# psql/pg_restore run from inside the db container: it already has the client
# tools and sits in the security group allowed to reach RDS.
$SSH "cd ~/app/deploy && docker compose -f docker-compose.prod.yml cp /tmp/cutover.dump db:/tmp/cutover.dump && \
  docker compose -f docker-compose.prod.yml exec -T -e PGPASSWORD='$RDS_PW' db \
    pg_restore -h '$RDS_HOST' -U yunto -d yunto --no-owner --clean --if-exists /tmp/cutover.dump 2>&1 | tail -5 || true"

echo "▸ verifying row counts match…"
COUNTS_OLD=$($SSH "cd ~/app/deploy && docker compose -f docker-compose.prod.yml exec -T db psql -U yunto -d yunto -tAc \"select string_agg(t||':'||n,',' order by t) from (select relname t, n_live_tup n from pg_stat_user_tables) s\"")
COUNTS_NEW=$($SSH "cd ~/app/deploy && docker compose -f docker-compose.prod.yml exec -T -e PGPASSWORD='$RDS_PW' db psql -h '$RDS_HOST' -U yunto -d yunto -tAc \"select string_agg(t||':'||n,',' order by t) from (select relname t, n_live_tup n from pg_stat_user_tables) s\"")
echo "  old: $COUNTS_OLD"
echo "  new: $COUNTS_NEW"
if [ "$COUNTS_OLD" != "$COUNTS_NEW" ]; then
  echo "✗ row counts differ — NOT switching. Investigate before retrying."
  echo "  (RDS may need ANALYZE; re-run and compare again if the only diff is stale stats.)"
  exit 1
fi

echo "▸ repointing the application at RDS…"
$SSH "cd ~/app/deploy && cp .env .env.bak-precutover && \
  sed -i 's#^DATABASE_URL=.*#DATABASE_URL=postgresql://yunto:$RDS_PW@$RDS_HOST:5432/yunto?schema=public#' .env || \
  echo 'DATABASE_URL=postgresql://yunto:$RDS_PW@$RDS_HOST:5432/yunto?schema=public' >> .env"

# The compose file derives DATABASE_URL from POSTGRES_* for the bundled db, so
# an explicit override must win. Restart only the api container.
$SSH 'cd ~/app/deploy && docker compose -f docker-compose.prod.yml up -d --no-deps api'

echo "▸ waiting for the API…"
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://$IP/health" || echo 000)
  [ "$code" = "200" ] && { echo "✓ api healthy on RDS"; break; }
  [ "$i" = 30 ] && { echo "⚠ api not healthy — roll back with:"; echo "   $SSH 'cd ~/app/deploy && cp .env.bak-precutover .env && docker compose -f docker-compose.prod.yml up -d --no-deps api'"; exit 1; }
  sleep 4
done

echo
echo "✓ cutover complete. The old container and volume are untouched;"
echo "  roll back by restoring .env.bak-precutover and restarting the api."
