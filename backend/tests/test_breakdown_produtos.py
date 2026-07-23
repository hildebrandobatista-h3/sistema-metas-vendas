"""Testes do endpoint GET /dashboard/breakdown-produtos."""
import pytest
from decimal import Decimal
from .conftest import criar_usuario_token
from app.models import Meta, Realizado
import datetime


URL = "/api/dashboard/breakdown-produtos"
PARAMS = {"ano": 2026, "periodo_tipo": "mensal", "periodo_ref": 7}


def _headers(token):
    return {"Authorization": f"Bearer {token}"}


def _seed_meta_realizado(db, e):
    db.add(Meta(
        vendedor_id=e["vend"].id,
        produto_id=e["prod"].id,
        periodo_id=e["periodo"].id,
        valor=Decimal("10000"),
        empresa_id=e["emp"].id,
        unidade_id=e["uni"].id,
        gerente_id=e["ger"].id,
    ))
    db.add(Realizado(
        vendedor_id=e["vend"].id,
        produto_id=e["prod"].id,
        data_venda=datetime.date(2026, 7, 10),
        valor=Decimal("7500"),
        empresa_id=e["emp"].id,
        unidade_id=e["uni"].id,
        gerente_id=e["ger"].id,
    ))
    db.commit()


def test_vendedor_recebe_403(client, db, estrutura):
    _, token = criar_usuario_token(db, "vendedor", vendedor_id=estrutura["vend"].id)
    r = client.get(URL, params=PARAMS, headers=_headers(token))
    assert r.status_code == 403
    assert "vendedor" in r.json()["detail"].lower()


def test_gerente_recebe_200(client, db, estrutura):
    _, token = criar_usuario_token(db, "gerente", gerente_id=estrutura["ger"].id)
    _seed_meta_realizado(db, estrutura)
    r = client.get(URL, params=PARAMS, headers=_headers(token))
    assert r.status_code == 200
    data = r.json()
    assert "produtos" in data
    assert len(data["produtos"]) == 1
    assert data["produtos"][0]["produto_nome"] == "Produto A"


def test_admin_recebe_200(client, db, estrutura):
    _, token = criar_usuario_token(db, "admin")
    _seed_meta_realizado(db, estrutura)
    r = client.get(URL, params=PARAMS, headers=_headers(token))
    assert r.status_code == 200
    data = r.json()
    assert len(data["produtos"]) == 1
    assert float(data["produtos"][0]["meta"]) == 10000.0
    assert float(data["produtos"][0]["realizado"]) == 7500.0
    assert data["produtos"][0]["percentual"] == 75.0


def test_sem_autenticacao_retorna_401(client, db, estrutura):
    r = client.get(URL, params=PARAMS)
    assert r.status_code == 401


def test_sem_dados_retorna_lista_vazia(client, db, estrutura):
    _, token = criar_usuario_token(db, "admin")
    r = client.get(URL, params=PARAMS, headers=_headers(token))
    assert r.status_code == 200
    assert r.json()["produtos"] == []
