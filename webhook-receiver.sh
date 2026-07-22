#!/bin/bash
set -euo pipefail

WEBHOOK_PORT=9000
WEBHOOK_TOKEN="${DEPLOY_WEBHOOK_TOKEN:-}"
DEPLOY_DIR="/root/metas-vendas"
LOG_FILE="${DEPLOY_DIR}/deploy.log"

log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] $@" | tee -a "${LOG_FILE}"
}

if [ -z "${WEBHOOK_TOKEN}" ]; then
    log "ERROR: DEPLOY_WEBHOOK_TOKEN not set"
    exit 1
fi

log "Starting webhook receiver on port ${WEBHOOK_PORT}"
log "Deploy dir: ${DEPLOY_DIR}"

# Simple webhook listener (nc or socat required)
while true; do
    {
        read -r request_line || true
        if [[ "${request_line}" == *"POST"* ]]; then
            log "Webhook received from GitHub Actions"
            # Execute deploy in background
            bash "${DEPLOY_DIR}/deploy.sh" &
        fi
    } | nc -l -p ${WEBHOOK_PORT} > /dev/null 2>&1 || true
done
