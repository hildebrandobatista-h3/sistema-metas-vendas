"""Aplicacao FastAPI do sistema de metas v2 (com autenticacao)."""
from fastapi import FastAPI

from .routers import cadastros, metas, realizado, dashboard, auth

app = FastAPI(title="Metas de Vendas", version="2.1.0")

app.include_router(auth.router, prefix="/api")
app.include_router(cadastros.router, prefix="/api")
app.include_router(metas.router, prefix="/api")
app.include_router(realizado.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "versao": "2.1.0"}
