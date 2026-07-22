#!/bin/bash
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-.}"
LOG_FILE="${DEPLOY_DIR}/deploy.log"

log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] $@" | tee -a "${LOG_FILE}"
}

log "Starting deployment..."
log "Validating environment..."

cd "${DEPLOY_DIR}"

# Check Docker
if ! command -v docker-compose &> /dev/null; then
    log "ERROR: Docker Compose not found"
    exit 1
fi

# Pull latest
log "Pulling latest code..."
git pull origin main --ff-only 2>&1 || true

# Docker rebuild
log "Rebuilding containers..."
docker-compose pull > /dev/null 2>&1
docker-compose down > /dev/null 2>&1
docker-compose up -d > /dev/null 2>&1

# Wait for services
sleep 10

# Health check
log "Running health checks..."
if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
    log "SUCCESS: Deployment completed successfully"
    exit 0
else
    log "ERROR: Health checks failed"
    exit 1
fi
