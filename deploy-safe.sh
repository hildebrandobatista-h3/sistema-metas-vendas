#!/bin/bash
# ✅ DEPLOY SEGURO - NUNCA apaga volumes
set -e

echo "🔒 DEPLOY SEGURO v1.0"
echo "===================="
echo ""

# BLOQUEIO: Se alguém passar -v, rejeita
if [[ "$@" == *"-v"* ]]; then
    echo "❌ ERRO: Você está tentando usar -v flag!"
    echo "⚠️  Isso apagaria TODOS os dados do banco de PRODUÇÃO!"
    echo "🛑 OPERAÇÃO BLOQUEADA"
    exit 1
fi

cd /root/metas-vendas

# Step 1: Contar metas ANTES
echo "1️⃣  Validando estado atual..."
METAS_BEFORE=$(docker exec metas_db psql -U metas_user -d metas_db -tc "SELECT COUNT(*) FROM meta;" 2>/dev/null | tr -d ' ' || echo "0")
echo "   Metas no banco: $METAS_BEFORE"
echo ""

# Step 2: Backup
echo "2️⃣  Fazendo backup..."
mkdir -p /root/backups/metas
BACKUP_FILE="/root/backups/metas/backup_$(date +%Y%m%d_%H%M%S).sql"
docker exec metas_db pg_dump -U metas_user metas_db > "$BACKUP_FILE" 2>/dev/null
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "   ✅ Backup: $BACKUP_FILE ($BACKUP_SIZE)"
echo ""

# Step 3: Build (SEM -v)
echo "3️⃣  Rebuilding containers..."
echo "   Frontend..."
docker-compose build --no-cache metas_frontend 2>&1 | grep -E "Successfully|error" | tail -1
echo "   Backend..."
docker-compose build --no-cache metas_backend 2>&1 | grep -E "Successfully|error" | tail -1
echo ""

# Step 4: Deploy (SEM -v)
echo "4️⃣  Deployando..."
docker-compose up -d 2>&1 | tail -3
echo ""

# Step 5: Aguardar inicialização
echo "5️⃣  Aguardando inicialização (10s)..."
sleep 10
echo ""

# Step 6: Validar integridade
echo "6️⃣  Validando integridade dos dados..."
METAS_AFTER=$(docker exec metas_db psql -U metas_user -d metas_db -tc "SELECT COUNT(*) FROM meta;" 2>/dev/null | tr -d ' ' || echo "0")
echo "   Metas no banco: $METAS_AFTER"
echo ""

if [ "$METAS_BEFORE" -eq "$METAS_AFTER" ]; then
    echo "✅ ✅ ✅ DEPLOY SUCESSO!"
    echo "   Dados preservados: $METAS_BEFORE metas"
    echo "   Backup em: $BACKUP_FILE"
    echo ""
else
    echo "❌ ERRO: Dados foram perdidos!"
    echo "   Antes: $METAS_BEFORE metas"
    echo "   Depois: $METAS_AFTER metas"
    echo "   Rollback automático..."
    docker-compose down
    docker exec metas_db psql -U metas_user -d metas_db < "$BACKUP_FILE"
    docker-compose up -d
    echo "   ✅ Rollback completado"
    exit 1
fi

# Step 7: Testar API
echo "7️⃣  Testando API..."
API_STATUS=$(curl -s -k -w "%{http_code}" -o /dev/null "https://62.72.9.246/api/login" -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "username=Admin&password=az721197" 2>/dev/null)
if [ "$API_STATUS" = "200" ] || [ "$API_STATUS" = "401" ]; then
    echo "   ✅ API respondendo ($API_STATUS)"
else
    echo "   ❌ API com erro ($API_STATUS)"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ DEPLOY SEGURO COMPLETADO COM SUCESSO"
echo "=========================================="
echo ""
echo "📊 Resumo:"
echo "   • Dados preservados: SIM ✅"
echo "   • Backup realizado: SIM ✅"
echo "   • API funcionando: SIM ✅"
echo ""
echo "📁 Backup location: $BACKUP_FILE"
echo ""
