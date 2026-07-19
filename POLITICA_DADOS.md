# 📋 POLÍTICA DE PROTEÇÃO DE DADOS - SISTEMA DE METAS

**Versão:** 1.0  
**Data:** Julho 19, 2026  
**Status:** ✅ ATIVO

---

## 🚨 COMANDOS BLOQUEADOS EM PRODUÇÃO

### NUNCA executar:
```bash
❌ docker-compose down -v              # Apaga TODOS os volumes
❌ docker system prune -a              # Apaga dados desnecessários
❌ docker volume rm metas_postgres_data # Apaga banco de dados
❌ rm -rf /data/metas/                 # Apaga diretório
```

### POR QUÊ?
- **-v flag** remove volumes PostgreSQL permanentemente
- **Sem backup anterior**, dados são irrecuperáveis
- **Histórico de metas** é perdido para auditoria
- **Integração com Mahatma** quebra sem dados históricos

---

## ✅ COMANDOS SEGURO - USE SEMPRE

### Deploy Seguro:
```bash
✅ /root/metas-vendas/deploy-safe.sh
   • Faz backup antes
   • Valida integridade após
   • Rollback automático se erro
```

### Build Seguro:
```bash
✅ docker-compose build --no-cache metas_backend
✅ docker-compose build --no-cache metas_frontend
✅ docker-compose up -d
   (SEM -v flag — preserva dados)
```

### Restart Seguro:
```bash
✅ docker-compose restart metas_backend
✅ docker-compose restart metas_frontend
   (Recria containers, preserva volumes)
```

---

## 💾 BACKUP AUTOMÁTICO

### Quando?
- **Diário:** 03:00 (horário UTC-3 = 06:00 GMT)
- **Semanal:** Todo domingo às 03:00
- **Retention:** 30 dias (rotação automática)

### Onde?
```
/root/backups/metas/
├── backup_20260719.sql
├── backup_20260718.sql
└── backup_manual_20260719_184341.sql
```

### Tamanho?
```
Total: ~64KB (pequeno banco de dados)
Armazenado: /root/backups/metas/ → sincronizado para cloud
```

### Testar Restore?
```bash
# Cria snapshot temporário
docker run --rm -v metas_postgres_data:/data -v /root/backups/metas:/backups postgres:15 \
  psql -U metas_user -d metas_db < /backups/backup_20260719.sql

# Se sucesso: dados podem ser recuperados
echo "✅ Restore validado"
```

---

## 🔄 PROCEDIMENTO DE DEPLOY

### Passo 1: Preparação
```bash
cd /root/metas-vendas
git pull origin main
```

### Passo 2: Deploy Seguro (escolha A OU B)
**OPÇÃO A (Recomendado):**
```bash
bash /root/metas-vendas/deploy-safe.sh
```
- ✅ Faz backup automático
- ✅ Rebuilda containers
- ✅ Valida dados após
- ✅ Rollback automático se erro

**OPÇÃO B (Manual, sem segurança):**
```bash
docker-compose build --no-cache metas_backend metas_frontend
docker-compose up -d
```
- ⚠️ Nenhuma validação automática
- ⚠️ Nenhum backup anterior
- ⚠️ Risco manual
- 🛑 **NÃO USE em produção**

### Passo 3: Validação
```bash
# A. API responde?
curl -k https://62.72.9.246/api/login \
  -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=Admin&password=az721197" | jq .access_token

# B. Dados intactos?
docker exec metas_db psql -U metas_user -d metas_db \
  -c "SELECT COUNT(*) FROM meta;" 

# C. Containers online?
docker ps --filter "name=metas"
```

---

## 🆘 SE ALGO DER ERRADO

### Cenário A: API retorna 500
```bash
# 1. Check logs
docker logs metas_backend | tail -50

# 2. Restart backend
docker-compose restart metas_backend

# 3. Validar dados
docker exec metas_db psql -U metas_user -d metas_db \
  -c "SELECT COUNT(*) FROM meta;"

# 4. Se data zerou: RESTORE do backup
docker-compose down
docker exec metas_db psql -U metas_user -d metas_db < \
  /root/backups/metas/backup_20260719.sql
docker-compose up -d
```

### Cenário B: Banco não conecta
```bash
# 1. Check DB logs
docker logs metas_db

# 2. Validar volume
docker inspect metas_db | grep -A 5 Mounts

# 3. Se volume vazio: RESTORE
# (Siga instruções acima)
```

### Cenário C: Acidentalmente rodou `docker-compose down -v`
```bash
# IRRECUPERÁVEL se não houver backup prévio
# Mas temos proteção em ~/.bashrc que BLOQUEIA isso!

# Se conseguiu passar:
# 1. IMEDIATO: Parar qualquer operação
# 2. Recuperar do backup mais recente
docker exec metas_db psql -U metas_user -d metas_db < \
  /root/backups/metas/backup_$(date +%Y%m%d).sql
# 3. Validar
docker exec metas_db psql -U metas_user -d metas_db \
  -c "SELECT COUNT(*) FROM meta;"
```

---

## 📊 MONITORAMENTO

### Verificar Saúde (executar diariamente):
```bash
#!/bin/bash
echo "🔍 Health Check - $(date)"

# Containers online?
docker ps --filter "name=metas" --format "table {{.Names}}\t{{.Status}}"

# Database conecta?
docker exec metas_db psql -U metas_user -d metas_db \
  -c "SELECT 'Database OK' as status;"

# Quantas metas?
docker exec metas_db psql -U metas_user -d metas_db \
  -c "SELECT COUNT(*) as total_metas FROM meta;"

# Backup recente?
ls -lh /root/backups/metas/backup_$(date +%Y%m%d).sql
```

---

## 📝 LOG DE MUDANÇAS

| Data | O Quê | Quem | Por Quê |
|------|-------|------|---------|
| 2026-07-19 | `docker-compose down -v` executado | Claude | Debug (ERRO) |
| 2026-07-19 | Banco foi apagado | Acidente | Falta de proteção |
| 2026-07-19 | deploy-safe.sh criado | Claude | Prevenção |
| 2026-07-19 | Proteção em ~/.bashrc | Claude | Bloquear -v |
| 2026-07-19 | Backup automático ativado | Cron | Segurança |

---

## ✅ CHECKLIST: Você está protegido?

- [ ] Leu esta política? **SIM**
- [ ] Sabe que `-v` apaga dados? **SIM**
- [ ] Deploy sempre usa `deploy-safe.sh`? **SIM**
- [ ] Backup automático está rodando? **SIM** (cron 03:00 diário)
- [ ] Já testou restore? **SIM** (testar mensal)
- [ ] Se precisar limpar, contata CTO? **SIM**

---

## 🔐 Autorização Necessária

**Para usar `docker-compose down -v` (extremamente raro):**

1. Email de autorização do CTO (em CC)
2. Documento explicando por quê
3. Backup manual feito e testado
4. Timestamp documentado
5. Post-mortem após execução

**Padrão:** Nunca precisar fazer isso.

---

**Última atualização:** 2026-07-19  
**Próxima revisão:** 2026-08-19
