# Sistema de Metas de Vendas

Definição e acompanhamento de metas de vendas, multiempresa, com dashboard de
indicadores. Não é um BI de análise livre nem um CRM — o dashboard responde a
uma única pergunta: quanto da meta foi atingido, por quem, de qual produto, em
qual janela de tempo.

Projeto isolado, sem relação de dados/segredos com outros sistemas na mesma
VPS. Ambiente desta fase: local apenas — **nada foi implantado na VPS**. O
`docker-compose.yml` e os scripts de backup estão prontos para revisão, mas
não foram executados.

## Stack

Mesma stack e convenções do projeto Mahatma (ver decisão na Etapa 0), com
ajustes pontuais anotados abaixo:

| Camada | Tecnologia |
|---|---|
| Backend | FastAPI (Python) + SQLAlchemy 2.0 + Alembic |
| Frontend | React + Vite + Tailwind + React Router + Zustand |
| Banco | PostgreSQL 15, dedicado (`metas_db`), sem porta pública |
| Testes | pytest (backend, 63 testes) |

## Decisões técnicas (Etapa 2)

- **Migrations com Alembic de verdade.** O Mahatma tem `alembic` no
  `requirements.txt` mas nunca usou — o schema lá é criado via
  `Base.metadata.create_all()` no startup. Aqui as migrations são reais e
  versionadas (`backend/alembic/versions/`), conforme exigido no escopo.
- **Tipos portáveis no SQLAlchemy** (`sa.Uuid`, `sa.Enum`) — mapeiam para
  `UUID`/`ENUM` nativos no Postgres (produção) e para tipos genéricos no
  SQLite (testes). Isso permite rodar toda a suite localmente sem precisar de
  Postgres/Docker instalado.
- **Python 3.9 localmente, 3.11 no Docker.** A máquina de desenvolvimento só
  tem Python 3.9 disponível (sem Homebrew Python, sem Docker). As bibliotecas
  usadas suportam 3.9 sem problema; o `Dockerfile` de produção continua
  mirando `python:3.11-slim`, igual ao Mahatma. Único cuidado: anotações de
  tipo `X | None` quebram em runtime no 3.9 dentro de schemas Pydantic e
  assinaturas de rota FastAPI (mesmo com `from __future__ import annotations`,
  pois o Pydantic resolve os tipos em runtime) — por isso o código usa
  `Optional[X]`/`typing` nesses pontos, e `X | None` só nos módulos internos
  (services), onde é seguro.
- **Sem segredos padrão fracos.** O Mahatma tem fallback tipo
  `SECRET_KEY: str = "changeme_secret_key"` e `ADMIN_PASSWORD: str =
  "admin123"` no código. Aqui `DATABASE_URL` e `SECRET_KEY` são obrigatórios
  (sem default) — a aplicação nem sobe sem eles.
- **CORS fechado por padrão** (`allow_origins=[]`), diferente do `["*"]` do
  Mahatma. Precisa ser configurado explicitamente quando o frontend for
  implementado.
- **Regra de piso em dois níveis** (decisão confirmada com o usuário): além da
  trava na publicação de cada *meta* individual (RASCUNHO→PUBLICADA), a
  publicação da *competência inteira* (ABERTA→PUBLICADA) também roda uma
  checagem de piso em bloco, cobrindo todos os nós/produtos daquela
  competência, e bloqueia se qualquer um estiver abaixo do piso. Isso não
  estava explícito no texto original — foi uma extrapolação meu no mockup da
  Etapa 1, aprovada explicitamente pelo usuário antes de virar código.
- **Fechar/reabrir competência fica para a Etapa 3.** A entidade
  `competencia` e a transição ABERTA→PUBLICADA já existem nesta etapa; a
  transição PUBLICADA→FECHADA e a reabertura entram junto com `venda`, porque
  o efeito prático de fechar (bloquear lançamento) só é testável com vendas
  existindo.
- **`log_auditoria` fica para a Etapa 3.** Seus casos de uso descritos no
  escopo (edição de venda, fechar/reabrir) ainda não existem nesta etapa;
  `meta_historico` já cobre a auditoria de alteração de meta.

## Decisões técnicas (Etapa 3)

- **Exclusão de venda é definitiva (hard delete)** — decisão confirmada com o
  usuário. O schema aprovado de `venda_historico` só tem `valor_anterior`
  (sem campo pra marcar exclusão lógica), então a linha de `venda` é mesmo
  removida; `venda_historico.venda_id` **não tem FK de banco** para
  `venda.id` propositalmente, pra sobreviver à exclusão do registro que
  documenta. O número da venda fica livre pra reuso depois de excluída.
- **`tipo_medida` da venda é derivado da meta, não escolhido no lançamento.**
  Evita o cliente mandar uma medida incompatível com a meta publicada daquele
  produto/nó.
- **Reabertura de competência volta para `PUBLICADA`, não para `ABERTA`.** O
  texto original não especifica o estado de destino — decidi `PUBLICADA`
  porque é o único status que permite lançar venda, e o propósito descrito da
  reabertura é justamente permitir entrar uma "venda esquecida".
- **Enum `tipo_medida` é reaproveitado entre `meta` e `venda`** (mesmo tipo
  Postgres) — a migration usa `create_type=False` na segunda tabela pra não
  tentar recriar o tipo.
- Escopo de visão (`_verificar_escopo`) foi extraído de `metas.py` para
  `app/core/scoping.py`, reaproveitado por `vendas.py` — evita duplicar a
  mesma checagem de árvore/hierarquia em dois routers.

## Decisões técnicas (Etapa 4)

- **Indicadores via VIEWS de banco** (`vw_estrutura_fechamento`,
  `vw_realizado_no`, `vw_atingimento`), conforme pedido no escopo — nenhuma
  view grava percentual pronto, só somas brutas de meta e realizado; a
  divisão acontece uma única vez, na camada de serviço, depois de somar tudo
  o que precisa ser somado. Isso é o que garante soma/soma e nunca média de
  percentuais, inclusive ao acumular vários meses (evolução) ou ao comparar
  janelas (YoY).
- **`vw_estrutura_fechamento`** é o fechamento transitivo da árvore
  (ancestral × descendente, via `WITH RECURSIVE`) — testado e funcional tanto
  em SQLite (testes locais) quanto é SQL padrão válido em Postgres
  (produção). É o que permite somar vendas de uma subárvore inteira para
  qualquer nó, em uma única consulta.
- **Meta de um nó nunca é a soma dos filhos — é a meta própria dele.** Quem
  sobe pela árvore por cálculo é só o *realizado* (soma das vendas da
  subárvore), exatamente como pedido no escopo. A meta de cada nível já é um
  valor definido explicitamente nele (e consistente com os filhos pela regra
  de piso da Etapa 2) — por isso o dashboard nunca precisa re-somar metas de
  filhos para mostrar o indicador de um nó.
- **Sem entidade nova para "histórico digitado manualmente".** O YoY lê os
  mesmos `competencia`/`meta`/`venda` de anos passados — um admin cadastra
  competência+meta+venda de 2025 do mesmo jeito que faria para 2026. Isso já
  cobre literalmente "nasce vazio, preenche conforme o histórico for
  digitado" sem precisar de uma tabela paralela.
- **Janela mês/trimestre/semestre/ano vira `mes_inicio`/`mes_fim` na API**,
  não um enum fixo — mais simples de testar e cobre os 4 casos do escopo sem
  lógica extra. Limitação assumida: a janela não cruza virada de ano (ex.
  nov/2025–jan/2026); não foi pedido e adicionaria complexidade sem
  necessidade clara agora.
- **Ranking e "% por nível" são o mesmo endpoint** (`GET
  /dashboard/nivel/{no_pai_id}`): lista os filhos diretos de um nó com
  meta/realizado/%. A navegação vendedor→gerente→diretor→unidade→empresa é
  só chamar de novo com o `no_pai_id` seguinte.
- **Alerta de gap reaproveita `verificar_piso_competencia`** (já existente
  desde a Etapa 2) como endpoint de leitura — mesma regra, sem duplicar
  lógica.

## Decisões técnicas (Etapa 5)

- **Frontend React implementado nesta etapa** — não estava na "Ordem de
  Trabalho" original (que só pedia núcleo/realizado/dashboard + testes no
  backend), mas o próprio pedido da Etapa 5 ("metas-app + metas-db") não
  fazia sentido sem uma aplicação real para dockerizar. Confirmado com o
  usuário antes de construir. Telas implementadas: login, cadastro de meta,
  lançamento de venda, fechamento de competência e dashboard — todas ligadas
  à API real, testadas no navegador (não só compiladas).
- **Bootstrap do primeiro Admin é script, não endpoint.** Não existe rota
  pública para criar o primeiro usuário Admin — isso seria a própria falha
  de segurança que o Mahatma tem meio resolvida com `ADMIN_PASSWORD` no
  ambiente. Aqui é `backend/scripts/seed_admin.py`, rodado manualmente uma
  vez (`python scripts/seed_admin.py --email ... --senha ...`).
- **`PRAGMA foreign_keys=ON` no SQLite** (`app/core/database.py`) — bug real
  encontrado ao popular dados de teste manualmente: um script de seed
  inseriu uma meta apontando para o id errado (usuário em vez de nó de
  estrutura) e o SQLite aceitou de boa, sem essa pragma. Sem isso, a suite
  inteira rodava sem checagem de integridade referencial nenhuma.
- **Três containers, não dois.** O texto da arquitetura-alvo fala em
  "metas-app + metas-db", mas a Etapa 0 (aprovada) determinou seguir
  exatamente o padrão do Mahatma, que separa frontend e backend. Fui pelo
  padrão já aprovado: `metas_frontend` (nginx, proxy `/api/` → backend) +
  `metas_backend` (FastAPI) + `metas_db` (Postgres). Fácil de reduzir para
  dois containers depois, se for essa a preferência.
- **Migrations rodam automaticamente no start do container** via
  `docker-entrypoint.sh` (`alembic upgrade head` antes do `uvicorn`) — mais
  seguro que depender de alguém lembrar de rodar manualmente a cada deploy.
- **Backup com teste de restore de verdade**, não só o dump. O Mahatma faz
  backup antes de cada deploy mas nunca testa se o arquivo restaura;
  `deploy/testar-restore.sh` sobe um Postgres descartável, restaura o dump
  nele e confere se as tabelas vieram, sem tocar no banco real.
- **Portas de host (8002/8090) e a questão do reverse proxy continuam em
  aberto** — documentado em `deploy/README.md`, precisa de confirmação do
  usuário antes do deploy de verdade.

## Estrutura

```
sistema-metas-vendas/
├── backend/
│   ├── app/
│   │   ├── core/       # config, database, security, deps (auth), scoping, views
│   │   ├── models/     # SQLAlchemy — 12 tabelas + views de dashboard
│   │   ├── schemas/    # Pydantic
│   │   ├── services/   # arvore.py, piso.py, auditoria.py, dashboard.py
│   │   └── routers/    # auth, estrutura, produtos, competencias, metas, vendas, dashboard
│   ├── alembic/versions/   # 3 migrations (núcleo; realizado+fechamento+auditoria; views)
│   ├── scripts/seed_admin.py   # cria o 1º usuário Admin (não existe via API)
│   ├── docker-entrypoint.sh    # alembic upgrade head + uvicorn
│   └── tests/
│       ├── routers/    # testes de API (integração)
│       └── services/   # testes de regra de negócio isolada
├── frontend/
│   └── src/
│       ├── pages/       # Login, Metas, Vendas, Competencias, Dashboard
│       ├── components/  # Layout, TreePicker, Pill, ProtectedRoute
│       ├── store/       # auth (zustand + persist), empresa
│       ├── services/    # api.js (axios + interceptor JWT), auth.js
│       └── hooks/       # useArvore
├── deploy/
│   ├── backup-metas-db.sh   # dump diário, dedicado, com retenção
│   ├── testar-restore.sh    # restaura num Postgres descartável e confere
│   └── README.md            # crontab sugerido, pontos em aberto
├── docker-compose.yml   # metas-net, metas_db sem porta pública — NÃO EXECUTADO
└── docs/
    └── etapa1-revisao.html   # modelo de dados + mockups (Etapa 1, aprovado)
```

## Rodando localmente

**Backend:**
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt

cp .env.example .env   # preencher DATABASE_URL (pode ser sqlite:///./dev.db
                        # localmente) e SECRET_KEY

alembic upgrade head                # cria o schema
python scripts/seed_admin.py --email admin@empresa.com --senha "..."

uvicorn app.main:app --reload       # http://localhost:8000

pytest -v   # suite completa — não precisa de Postgres, usa SQLite em memória
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173 — proxy /api → localhost:8000 embutido
```

## Status

- **Etapa 0** — stack definida a partir da inspeção do Mahatma. ✅
- **Etapa 1** — modelo de dados + mockups aprovados. ✅
- **Etapa 2** — núcleo (estrutura, metas, competência) + testes. ✅ Cobre:
  piso na publicação (meta e competência), unicidade de meta, unicidade de
  competência, histórico de alteração de meta, somente-leitura após
  fechamento, escopo de visão por papel.
- **Etapa 3** — realizado/vendas + fechar/reabrir + auditoria. ✅ Cobre:
  unicidade de número de venda, bloqueio sem meta publicada, bloqueio com
  competência não publicada, data fora do mês, edição/exclusão restrita a
  Admin com histórico, somente-leitura pós-fechamento, reabertura auditada
  com motivo obrigatório, fluxo completo "venda esquecida" (fecha → bloqueia
  → reabre → libera).
- **Etapa 4** — dashboard/indicadores. ✅ Cobre: prova concreta de soma/soma
  ≠ média de percentuais (cenário onde a média simples daria 55% e a conta
  correta dá 18,18%), meta própria vs realizado da subárvore, ranking/nível,
  YoY vazio sem histórico e preenchido conforme histórico é digitado, alerta
  de gap.
- **Suite:** 63/63 testes passando (`cd backend && pytest -v`).
- **Etapa 5** — frontend + docker-compose + backup (sem deploy). ✅ Frontend
  construído e testado manualmente no navegador contra o backend real (todas
  as 4 telas, com dados reais, incluindo os fluxos de bloqueio/erro). Dois
  bugs reais encontrados e corrigidos nesse processo: loop infinito de
  re-render no Dashboard (`useArvore` devolvendo objeto novo a cada render)
  e falta de checagem de FK no SQLite de teste. `docker-compose.yml` e
  scripts de backup prontos para revisão — **nada executado na VPS**.

## O que ficou de fora (não pedido no escopo original)

- Testes automatizados do frontend (o Mahatma tem vitest; aqui a validação
  foi manual, no navegador, cobrindo os fluxos principais e de erro).
- Telas de administração de estrutura (cadastro de empresa/unidade/usuário)
  — hoje isso só existe via API; o mockup aprovado na Etapa 1 não incluía
  essas telas, só as 4 operacionais.
