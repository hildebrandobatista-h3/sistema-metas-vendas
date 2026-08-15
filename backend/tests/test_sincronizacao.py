"""TDD: GET /api/sincronizacao/oportunidades deve retornar nomes de usuários (criado_por/atualizado_por)."""
import os
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only")

from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import get_db
from app.main import app
from app.models import Base, Usuario, OportunidadeNectar, ParamIntegracao
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


def _token(usuario):
    tok = criar_token(usuario.id, usuario.perfil)
    return {"Authorization": f"Bearer {tok}"}


@pytest.fixture()
def cenario_crm(db):
    admin = Usuario(login="admin", senha_hash=hash_senha("x"), perfil="admin", nome="João Admin")
    outro = Usuario(login="outro", senha_hash=hash_senha("x"), perfil="admin", nome="Maria Silva")
    db.add_all([admin, outro])
    db.flush()

    param = ParamIntegracao(
        tipo_integracao="nectar_crm",
        endpoint_base="https://api.nectar.com",
        token="tok",
        ativo=True,
        criado_por=admin.id,
    )
    db.add(param)
    db.flush()

    opp = OportunidadeNectar(
        param_integracao_id=param.id,
        id_oportunidade_ext=999,
        nome="Oportunidade Teste",
        cliente="Cliente LTDA",
        valor=1500.00,
        status_sincronizacao="pendente",
        data_sincronizacao=datetime(2026, 8, 15, 10, 0, 0, tzinfo=timezone.utc),
        mensagem_erro="Responsável X",
        criado_por=admin.id,
        atualizado_por=outro.id,
    )
    db.add(opp)
    db.commit()

    return {"admin": admin, "outro": outro, "param": param, "opp": opp}


def test_listar_oportunidades_retorna_13_campos(client, cenario_crm):
    admin = cenario_crm["admin"]
    r = client.get("/api/sincronizacao/oportunidades", headers=_token(admin))
    assert r.status_code == 200
    body = r.json()
    assert len(body) == 1
    item = body[0]

    campos_esperados = [
        "id", "param_integracao_id", "id_oportunidade_ext",
        "nome", "cliente", "valor", "status_sincronizacao",
        "data_sincronizacao", "mensagem_erro", "criado_em", "atualizado_em",
        "criado_por", "atualizado_por",
        "criado_por_nome", "atualizado_por_nome",
    ]
    for campo in campos_esperados:
        assert campo in item, f"Campo ausente: {campo}"


def test_listar_oportunidades_resolve_nomes_usuarios(client, cenario_crm):
    admin = cenario_crm["admin"]
    opp = cenario_crm["opp"]
    r = client.get("/api/sincronizacao/oportunidades", headers=_token(admin))
    assert r.status_code == 200
    item = r.json()[0]

    assert item["criado_por"] == opp.criado_por          # ID numérico mantido
    assert item["atualizado_por"] == opp.atualizado_por  # ID numérico mantido
    assert item["criado_por_nome"] == "João Admin"
    assert item["atualizado_por_nome"] == "Maria Silva"


def test_listar_oportunidades_nomes_none_quando_sem_usuario(client, cenario_crm, db):
    admin = cenario_crm["admin"]
    param = cenario_crm["param"]

    opp_sem_usuario = OportunidadeNectar(
        param_integracao_id=param.id,
        id_oportunidade_ext=888,
        nome="Sem Usuário",
        cliente=None,
        valor=None,
        status_sincronizacao="pendente",
        criado_por=None,
        atualizado_por=None,
    )
    db.add(opp_sem_usuario)
    db.commit()

    r = client.get("/api/sincronizacao/oportunidades", headers=_token(admin))
    assert r.status_code == 200
    sem = next(i for i in r.json() if i["id"] == opp_sem_usuario.id)
    assert sem["criado_por_nome"] is None
    assert sem["atualizado_por_nome"] is None


def test_listar_oportunidades_filtro_status(client, cenario_crm, db):
    admin = cenario_crm["admin"]
    param = cenario_crm["param"]

    opp_ignorado = OportunidadeNectar(
        param_integracao_id=param.id,
        id_oportunidade_ext=777,
        nome="Ignorado",
        status_sincronizacao="ignorado",
    )
    db.add(opp_ignorado)
    db.commit()

    r = client.get("/api/sincronizacao/oportunidades", params={"status": "pendente"}, headers=_token(admin))
    assert r.status_code == 200
    ids_status = {i["status_sincronizacao"] for i in r.json()}
    assert ids_status == {"pendente"}
