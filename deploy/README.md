# Deploy — Sistema de Metas de Vendas

**Nada aqui foi executado na VPS.** Este diretório só documenta e prepara o
que vai ser necessário quando o deploy for autorizado.

## Backup

- `backup-metas-db.sh` — dump diário do `metas_db`, comprimido, com retenção
  de 14 dias. Independente do backup do Mahatma (diretório, nome de
  container e arquivo próprios: `/root/backups/metas/`, `metas_db_*.sql.gz`).
- `testar-restore.sh` — restaura um backup específico num Postgres
  descartável (nunca no `metas_db` real) e confere se as tabelas vieram.
  Deve rodar periodicamente para garantir que os backups são utilizáveis,
  não só que existem.

### Crontab sugerido (a instalar manualmente, com autorização)

```cron
# Backup diário às 03:00
0 3 * * * /root/metas-vendas/deploy/backup-metas-db.sh >> /root/logs/metas-backup.log 2>&1

# Teste de restore semanal (domingo, 04:00) do backup mais recente
0 4 * * 0 /root/metas-vendas/deploy/testar-restore.sh "$(ls -t /root/backups/metas/metas_db_*.sql.gz | head -1)" >> /root/logs/metas-restore-test.log 2>&1
```

## Subindo o sistema (quando autorizado)

```bash
cd /root/metas-vendas   # ou onde o repo for clonado na VPS
cp .env.example .env
nano .env               # preencher DB_PASSWORD, SECRET_KEY, portas

docker compose up -d --build
docker compose ps       # todos devem estar "Up" / "healthy"
```

Migrations rodam automaticamente no start do `metas_backend`
(`docker-entrypoint.sh` chama `alembic upgrade head` antes de subir a API).

## Pontos em aberto — confirmar com o usuário antes do deploy

1. **Portas de host** (`BACKEND_PORT`, `FRONTEND_PORT` no `.env`) — usei
   8002/8090 como valores livres observados na inspeção da Etapa 0, mas não
   confirmados.
2. **Reverse proxy** — a VPS tem nginx instalado mas inativo (só um site
   `metabase` configurado). Se o usuário preferir subdomínio via proxy em
   vez de porta direta, o `docker-compose.yml` não muda — só a configuração
   de nginx do host, fora deste repositório.
3. **Rede `metas-net`** é criada isolada por este `docker-compose.yml` — não
   compartilha rede com `mahatma_default` nem `mahatma-staging_default`.
