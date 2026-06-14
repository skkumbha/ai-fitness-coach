#!/usr/bin/env bash
# Production: pull frontend image from Docker Hub → run container → reload nginx
#
# Usage:
#   ./prod-run.sh                                    # uses FRONTEND_IMAGE_NAME from .env.prod (default :latest)
#   ./prod-run.sh feat-telegarm-v1                   # branch tag (slashes become dashes in Docker Hub)
#   ./prod-run.sh sreeramkumbham/fitness-assistant-frontend:feat-telegarm-v1
if [ -z "${BASH_VERSION:-}" ]; then
  exec bash "$0" "$@"
fi
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

ENV_FILE=".env.prod"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy .env.prod.example to .env.prod on the server."
  exit 1
fi

# shellcheck disable=SC1090
set -a && source "$ENV_FILE" && set +a

: "${FRONTEND_IMAGE_REPO:?Set FRONTEND_IMAGE_REPO in .env.prod}"
: "${FRONTEND_CONTAINER_NAME:?Set FRONTEND_CONTAINER_NAME in .env.prod}"
: "${FRONTEND_PORT:?Set FRONTEND_PORT in .env.prod}"

if [[ -n "${1:-}" ]]; then
  if [[ "$1" == *:* ]] || [[ "$1" == */* ]]; then
    FRONTEND_IMAGE_NAME="$1"
  else
    FRONTEND_IMAGE_NAME="${FRONTEND_IMAGE_REPO}:${1}"
  fi
  echo "Using image: $FRONTEND_IMAGE_NAME"
else
  : "${FRONTEND_IMAGE_NAME:?Set FRONTEND_IMAGE_NAME in .env.prod or pass a tag as argument}"
fi

echo "📦 Pulling image..."
docker pull "$FRONTEND_IMAGE_NAME"

echo "🛑 Stopping existing container..."
docker rm -f "$FRONTEND_CONTAINER_NAME" 2>/dev/null || true

echo "🐳 Starting container..."
docker run -d \
  -p "${FRONTEND_PORT}:80" \
  --name "$FRONTEND_CONTAINER_NAME" \
  --restart unless-stopped \
  "$FRONTEND_IMAGE_NAME"

echo "⏳ Waiting for frontend on port ${FRONTEND_PORT}..."
for i in $(seq 1 15); do
  if curl -sf "http://localhost:${FRONTEND_PORT}/" >/dev/null 2>&1; then
    echo "✅ Frontend is ready"
    break
  fi
  sleep 2
done

if command -v systemctl >/dev/null 2>&1; then
  echo "🔄 Reloading nginx..."
  sudo systemctl reload nginx
fi

docker ps --filter "name=${FRONTEND_CONTAINER_NAME}"
echo ""
echo "✅ Deployment finished"
echo "   Image:   $FRONTEND_IMAGE_NAME"
echo "   Public:  https://fit.kish.rs"
echo "   Local:   http://localhost:${FRONTEND_PORT}"
echo ""
echo "Useful commands:"
echo "   docker logs -f ${FRONTEND_CONTAINER_NAME}"
echo "   docker stop ${FRONTEND_CONTAINER_NAME}"
