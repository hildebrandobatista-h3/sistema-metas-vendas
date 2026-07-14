#!/bin/bash
# Testa se um backup é restaurável de verdade. Sobe um Postgres DESCARTÁVEL
# à parte — fora da metas-net, nome de container diferente — restaura o
# dump nele e confere se as tabelas vieram. Nunca toca no metas_db real.
#
# Uso: ./testar-restore.sh /root/backups/metas/metas_db_20260714_030000.sql.gz
set -euo pipefail

ARQUIVO="${1:?uso: testar-restore.sh <caminho-do-backup.sql.gz>}"
CONTAINER_TESTE="metas_db_teste_restore"

if [ ! -f "$ARQUIVO" ]; then
    echo "Arquivo não encontrado: $ARQUIVO" >&2
    exit 1
fi

echo "Subindo Postgres descartável para o teste..."
docker run -d --rm \
    --name "$CONTAINER_TESTE" \
    -e POSTGRES_DB=metas_db \
    -e POSTGRES_USER=metas_user \
    -e POSTGRES_PASSWORD=teste_restore_temporario \
    postgres:15-alpine > /dev/null

trap 'docker stop "$CONTAINER_TESTE" > /dev/null 2>&1 || true' EXIT

echo "Aguardando banco de teste ficar pronto..."
PRONTO=""
for _ in $(seq 1 30); do
    if docker exec "$CONTAINER_TESTE" pg_isready -U metas_user > /dev/null 2>&1; then
        PRONTO=1
        break
    fi
    sleep 1
done
if [ -z "$PRONTO" ]; then
    echo "ERRO: banco de teste não ficou pronto a tempo." >&2
    exit 1
fi

echo "Restaurando $ARQUIVO..."
gunzip -c "$ARQUIVO" | docker exec -i "$CONTAINER_TESTE" psql -U metas_user metas_db > /dev/null

QTD_TABELAS=$(docker exec "$CONTAINER_TESTE" psql -U metas_user metas_db -tAc \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'")

echo "Restore concluído — tabelas encontradas: $QTD_TABELAS"

if [ "$QTD_TABELAS" -lt 1 ]; then
    echo "ERRO: restore não criou nenhuma tabela — backup pode estar corrompido." >&2
    exit 1
fi

echo "Restore testado com sucesso. Banco de teste será removido agora."
