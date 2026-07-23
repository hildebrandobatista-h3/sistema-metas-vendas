"""Fixtures de teste para o sistema de metas."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db import get_db
from app.models.base import Base
from app.models import Empresa, Unidade, Gerente, Vendedor, Produto, Periodo, Meta, Realizado, Usuario
from app.security import hash_senha, criar_token

SQLALCHEMY_TEST_URL = "sqlite:///:memory:"

engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSession()

    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def estrutura(db):
    """Cria estrutura mínima: empresa, unidade, gerente, vendedor, produto, período."""
    emp = Empresa(nome="Emp Teste")
    db.add(emp)
    db.flush()
    uni = Unidade(nome="Uni Teste", empresa_id=emp.id)
    db.add(uni)
    db.flush()
    ger = Gerente(nome="Ger Teste", unidade_id=uni.id)
    db.add(ger)
    db.flush()
    vend = Vendedor(nome="Vend Teste", gerente_id=ger.id)
    db.add(vend)
    db.flush()
    prod = Produto(nome="Produto A")
    db.add(prod)
    db.flush()
    periodo = Periodo(ano=2026, mes=7)
    db.add(periodo)
    db.flush()
    db.commit()
    return {"emp": emp, "uni": uni, "ger": ger, "vend": vend, "prod": prod, "periodo": periodo}


def criar_usuario_token(db, perfil: str, vendedor_id=None, gerente_id=None):
    u = Usuario(
        nome=f"user_{perfil}",
        login=f"user_{perfil}",
        senha_hash=hash_senha("senha123"),
        perfil=perfil,
        ativo=True,
        vendedor_id=vendedor_id,
        gerente_id=gerente_id,
    )
    db.add(u)
    db.commit()
    token = criar_token(u.id, perfil)
    return u, token
