#!/bin/bash
# Backup diário do metas_db — dedicado e separado do backup do Mahatma
# (diretório, nome de arquivo e container distintos). Pensado para rodar via
# cron (ver deploy/README.md para o crontab sugerido).
set -euo pipefail

BACKUP_DIR="/root/backups/metas"
RETENCAO_DIAS=14
DATA=$(date +%Y%m%d_%H%M%S)
ARQUIVO="$BACKUP_DIR/metas_db_$DATA.sql.gz"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

mkdir -p "$BACKUP_DIR"

docker exec metas_db pg_dump -U metas_user metas_db | gzip > "$ARQUIVO"

if [ -s "$ARQUIVO" ]; then
    echo "$LOG_PREFIX Backup criado: $ARQUIVO ($(du -h "$ARQUIVO" | cut -f1))"
else
    echo "$LOG_PREFIX ERRO: backup vazio ou falhou" >&2
    rm -f "$ARQUIVO"
    exit 1
fi

# Retenção: apaga backups mais velhos que RETENCAO_DIAS.
find "$BACKUP_DIR" -name "metas_db_*.sql.gz" -mtime "+$RETENCAO_DIAS" -delete
echo "$LOG_PREFIX Backups com mais de $RETENCAO_DIAS dias removidos."
