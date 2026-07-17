from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, competencias, dashboard, estrutura, metas, produtos, vendas

app = FastAPI(
    title="Sistema de Metas de Vendas",
    description="Definição e acompanhamento de metas de vendas, multiempresa.",
    version="0.1.0",
)

# Sem origens liberadas por padrão — configurar explicitamente quando o
# frontend for implementado (evita o CORS aberto "*" usado no Mahatma).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(estrutura.router)
app.include_router(produtos.router)
app.include_router(competencias.router)
app.include_router(metas.router)
app.include_router(vendas.router)
app.include_router(dashboard.router)


@app.get("/")
def root() -> dict:
    return {"message": "Sistema de Metas de Vendas - API Online", "version": "0.1.0"}
