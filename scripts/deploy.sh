#!/usr/bin/env bash
# Build-and-deploy helper script
# Usage: ./scripts/deploy.sh <server> <user> <remote_base_dir>
# Example: ./scripts/deploy.sh 203.0.113.5 hazem /var/www/propestateai

set -euo pipefail
SERVER=${1:-}
USER=${2:-}
REMOTE_BASE=${3:-}

if [ -z "$SERVER" ] || [ -z "$USER" ] || [ -z "$REMOTE_BASE" ]; then
  echo "Usage: $0 <server> <user> <remote_base_dir>"
  exit 2
fi

echo "Building web frontend..."
pushd web-frontend/webfront
npm ci
npm run build
popd

echo "Building mobile frontend..."
pushd mobile-frontend
npm ci
npm run build
popd

echo "Preparing remote directories on $SERVER..."
ssh ${USER}@${SERVER} "mkdir -p ${REMOTE_BASE}/web || true; mkdir -p ${REMOTE_BASE}/mobile || true; mkdir -p ${REMOTE_BASE}/backend || true"

echo "Uploading web build..."
scp -r web-frontend/webfront/build/* ${USER}@${SERVER}:${REMOTE_BASE}/web/

echo "Uploading mobile build..."
scp -r mobile-frontend/dist/* ${USER}@${SERVER}:${REMOTE_BASE}/mobile/

echo "Copying backend (server will still need venv & pip install on remote)..."
scp -r backend/realestate_agent ${USER}@${SERVER}:${REMOTE_BASE}/backend/

cat <<'EOF'
Done. Next steps on server (manual):
- Set up Python venv, install requirements: pip install -r requirements.txt
- Configure environment variables (API keys).
- Set up systemd unit to run uvicorn (a template is in deploy/nginx-systemd/realestate-uvicorn.service)
- Configure nginx to serve static files and reverse proxy /api/ to uvicorn
- Reload nginx and enable systemd unit

If you want I can also create the nginx and systemd files in the repo.
EOF
