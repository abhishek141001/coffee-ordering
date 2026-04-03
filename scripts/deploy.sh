#!/bin/bash

# Deploy/rebuild coffee-ordering on server using Docker
# Usage: ./scripts/deploy.sh [service]
# Examples:
#   ./scripts/deploy.sh          # Rebuild all services
#   ./scripts/deploy.sh backend  # Rebuild only backend
#   ./scripts/deploy.sh web      # Rebuild only web

set -e

cd "$(dirname "$0")/.."

echo "==> Pulling latest code..."
git pull origin main

SERVICE=$1

if [ -n "$SERVICE" ]; then
  echo "==> Rebuilding $SERVICE..."
  docker compose build --no-cache "$SERVICE"
  echo "==> Restarting $SERVICE..."
  docker compose up -d "$SERVICE"
else
  echo "==> Rebuilding all services..."
  docker compose build --no-cache
  echo "==> Restarting all services..."
  docker compose up -d
fi

echo "==> Cleaning up old images..."
docker image prune -f

echo "==> Current status:"
docker compose ps

echo "==> Deploy complete!"
