#!/usr/bin/env bash
# Builds the SPA, ships the app to the EC2 box, and brings the stack up.
# Safe to re-run: it is the redeploy path too.
#
#   source deploy/aws-env.sh && ./deploy/ship.sh
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
KEY="$HERE/yunto-demo.pem"
IP="$(cat "$HERE/.instance-ip")"
SSH="ssh -i $KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 ec2-user@$IP"

echo "▸ target: $IP"

# --- wait for the host to be able to build and run containers ---------------
# Probe the actual capability rather than a marker file: cloud-init writes
# /tmp/bootstrap-done, but systemd-tmpfiles clears /tmp on a schedule, so the
# marker disappears on a long-lived instance and every later deploy would hang.
echo "▸ waiting for docker + buildx…"
for i in $(seq 1 60); do
  if $SSH 'docker info >/dev/null 2>&1 && docker buildx version >/dev/null 2>&1 && docker compose version >/dev/null 2>&1' 2>/dev/null; then
    echo "▸ host ready"; break
  fi
  [ "$i" = 60 ] && { echo "✗ host never became ready (docker/buildx/compose missing)"; exit 1; }
  sleep 10
done

# --- build the SPA locally (VITE_API_URL=/api comes from .env.production) ----
echo "▸ building web…"
(cd "$ROOT/web" && npm run build >/dev/null)

# --- generate server-side secrets once, then reuse them ---------------------
if ! $SSH 'test -f ~/app/deploy/.env' 2>/dev/null; then
  echo "▸ generating production secrets…"
  PGPASS="$(openssl rand -base64 36 | tr -d '/+=' | head -c 40)"
  JWT="$(openssl rand -base64 48 | tr -d '/+=' | head -c 56)"
  NEWENV=1
else
  echo "▸ reusing existing secrets on the box"
  NEWENV=0
fi

# --- copy the app ------------------------------------------------------------
echo "▸ syncing files…"
$SSH 'mkdir -p ~/app/deploy ~/app/server ~/app/web'
rsync -az --delete -e "ssh -i $KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
  --exclude node_modules --exclude .env --exclude '*.pem' --exclude '.instance-*' --exclude '.aws-account' \
  "$ROOT/server/" "ec2-user@$IP:~/app/server/"
rsync -az --delete -e "ssh -i $KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
  --exclude .env --exclude '*.pem' --exclude '.instance-*' --exclude '.aws-account' \
  "$HERE/" "ec2-user@$IP:~/app/deploy/"
rsync -az --delete -e "ssh -i $KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
  "$ROOT/web/dist/" "ec2-user@$IP:~/app/web/dist/"

if [ "$NEWENV" = 1 ]; then
  $SSH "cat > ~/app/deploy/.env" <<EOF
POSTGRES_USER=yunto
POSTGRES_PASSWORD=$PGPASS
POSTGRES_DB=yunto
JWT_SECRET=$JWT
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://$IP
SEED_ON_BOOT=true
WEB_PORT=80
EOF
  $SSH 'chmod 600 ~/app/deploy/.env'
fi

# --- bring the stack up ------------------------------------------------------
echo "▸ building images and starting containers (first run takes a few minutes)…"
$SSH 'cd ~/app/deploy && docker compose -f docker-compose.prod.yml up -d --build' 2>&1 | tail -12

echo "▸ waiting for the API to answer…"
for i in $(seq 1 40); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://$IP/health" || echo 000)
  [ "$code" = "200" ] && { echo "▸ api healthy"; break; }
  [ "$i" = 40 ] && echo "⚠ api did not report healthy — check: $SSH 'cd ~/app/deploy && docker compose -f docker-compose.prod.yml logs api'"
  sleep 5
done

echo
echo "✓ live: http://$IP"
echo "  login: admin@yunto.com / password123"
