import os
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only")

from datetime import date
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import get_db
from app.main import app
from app.models import Base, Empresa, Unidade, Gerente, Vendedor, Produto, Periodo, Meta, Realizado, Usuario
from app.security import hash_senha, criar_token


@pytest.fixture()
def db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def _token(usuario: Usuario) -> dict:
    tok = criar_token(usuario.id, usuario.perfil)
    return {"Authorization": f"Bearer {tok}"}


@pytest.fixture()
def cenario(db):
    """Monta empresa > unidade > gerente > 2 vendedores + 2 produtos + metas + realizado."""
    empresa = Empresa(nome="Empresa Teste")
    db.add(empresa); db.flush()

    unidade = Unidade(empresa_id=empresa.id, nome="Unidade A")
    db.add(unidade); db.flush()

    gerente = Gerente(unidade_id=unidade.id, nome="Gerente A")
    db.add(gerente); db.flush()

    v1 = Vendedor(gerente_id=gerente.id, nome="Vendedor 1")
    v2 = Vendedor(gerente_id=gerente.id, nome="Vendedor 2")
    db.add_all([v1, v2]); db.flush()

    p1 = Produto(nome="Setup")
    p2 = Produto(nome="MRR")
    db.add_all([p1, p2]); db.flush()

    per = Periodo(ano=2026, mes=7)
    db.add(per); db.flush()

    db.add_all([
        Meta(vendedor_id=v1.id, produto_id=p1.id, periodo_id=per.id,
             empresa_id=empresa.id, unidade_id=unidade.id, gerente_id=gerente.id, valor=Decimal("1000")),
        Meta(vendedor_id=v1.id, produto_id=p2.id, periodo_id=per.id,
             empresa_id=empresa.id, unidade_id=unidade.id, gerente_id=gerente.id, valor=Decimal("2000")),
        Meta(vendedor_id=v2.id, produto_id=p1.id, periodo_id=per.id,
             empresa_id=empresa.id, unidade_id=unidade.id, gerente_id=gerente.id, valor=Decimal("500")),
    ])
    db.add_all([
        Realizado(vendedor_id=v1.id, produto_id=p1.id, data_venda=date(2026, 7, 1), valor=Decimal("800"),
                  empresa_id=empresa.id, unidade_id=unidade.id, gerente_id=gerente.id),
        Realizado(vendedor_id=v2.id, produto_id=p1.id, data_venda=date(2026, 7, 5), valor=Decimal("300"),
                  empresa_id=empresa.id, unidade_id=unidade.id, gerente_id=gerente.id),
    ])

    admin = Usuario(login="admin", senha_hash=hash_senha("x"), perfil="admin", nome="Admin")
    ger_user = Usuario(login="gerente", senha_hash=hash_senha("x"), perfil="gerente",
                       nome="Ger", gerente_id=gerente.id)
    vend_user = Usuario(login="vendedor1", senha_hash=hash_senha("x"), perfil="vendedor",
                        nome="V1", vendedor_id=v1.id)

    db.add_all([admin, ger_user, vend_user]); db.commit()

    return {
        "empresa": empresa, "unidade": unidade, "gerente": gerente,
        "v1": v1, "v2": v2, "p1": p1, "p2": p2, "per": per,
        "admin": admin, "ger_user": ger_user, "vend_user": vend_user,
        "tok_admin": _token(admin), "tok_gerente": _token(ger_user), "tok_vendedor": _token(vend_user),
    }
