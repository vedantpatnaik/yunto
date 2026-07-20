#!/bin/sh
# Wait for Postgres, sync the schema, then optionally seed demo data.
set -e

echo "waiting for database…"
until npx prisma db push --skip-generate >/dev/null 2>&1; do
  sleep 2
done
echo "schema in sync"

# Seeding is opt-in per boot. The seed script is written to be idempotent for
# the demo dataset; leave SEED_ON_BOOT unset in a real environment.
if [ "$SEED_ON_BOOT" = "true" ]; then
  echo "seeding demo data…"
  npx tsx prisma/seed.ts || echo "seed failed or already populated — continuing"
fi

exec "$@"
