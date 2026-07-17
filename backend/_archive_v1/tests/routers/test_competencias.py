from __future__ import annotations

from decimal import Decimal

from app.models.enums import StatusCompetencia, StatusMeta, TipoMedida
from app.models.meta import Meta
from tests.conftest import auth_headers


def test_criar_competencia_sucesso(client, arvore):
    resp = client.post(
        "/competencias",
        json={"empresa_id": str(arvore.empresa.id), "ano": 2026, "mes": 8},
        headers=auth_headers(arvore.admin),
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "ABERTA"


def test_competencia_unica_por_empresa_ano_mes(client, arvore, competencia_aberta):
    resp = client.post(
        "/competencias",
        json={"empresa_id": str(arvore.empresa.id), "ano": competencia_aberta.ano, "mes": competencia_aberta.mes},
        headers=auth_headers(arvore.admin),
    )
    assert resp.status_code == 409


def test_criar_competencia_exige_admin(client, arvore):
    resp = client.post(
        "/competencias",
        json={"empresa_id": str(arvore.empresa.id), "ano": 2026, "mes": 9},
        headers=auth_headers(arvore.gerente),
    )
    assert resp.status_code == 403


def test_publicar_competencia_bloqueada_quando_ha_violacao_de_piso(db_session, client, arvore, competencia_aberta):
    db_session.add_all(
        [
            Meta(
                competencia_id=competencia_aberta.id,
                estrutura_no_id=arvore.no_gerente.id,
                produto_id=arvore.produto.id,
                tipo_medida=TipoMedida.VALOR,
                valor_meta=Decimal("50000.00"),
                status=StatusMeta.RASCUNHO,
            ),
            Meta(
                competencia_id=competencia_aberta.id,
                estrutura_no_id=arvore.no_vendedor.id,
                produto_id=arvore.produto.id,
                tipo_medida=TipoMedida.VALOR,
                valor_meta=Decimal("42000.00"),
                status=StatusMeta.RASCUNHO,
            ),
        ]
    )
    db_session.commit()

    resp = client.post(
        f"/competencias/{competencia_aberta.id}/publicar", headers=auth_headers(arvore.admin)
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["publicada"] is False
    assert len(body["violacoes"]) == 1
    assert body["violacoes"][0]["gap"] == "8000.00"

    db_session.refresh(competencia_aberta)
    assert competencia_aberta.status == StatusCompetencia.ABERTA


def test_publicar_competencia_sucesso_quando_piso_atendido(db_session, client, arvore, competencia_aberta):
    db_session.add_all(
        [
            Meta(
                competencia_id=competencia_aberta.id,
                estrutura_no_id=arvore.no_gerente.id,
                produto_id=arvore.produto.id,
                tipo_medida=TipoMedida.VALOR,
                valor_meta=Decimal("50000.00"),
                status=StatusMeta.RASCUNHO,
            ),
            Meta(
                competencia_id=competencia_aberta.id,
                estrutura_no_id=arvore.no_vendedor.id,
                produto_id=arvore.produto.id,
                tipo_medida=TipoMedida.VALOR,
                valor_meta=Decimal("50000.00"),
                status=StatusMeta.RASCUNHO,
            ),
        ]
    )
    db_session.commit()

    resp = client.post(
        f"/competencias/{competencia_aberta.id}/publicar", headers=auth_headers(arvore.admin)
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["publicada"] is True
    assert body["violacoes"] == []

    db_session.refresh(competencia_aberta)
    assert competencia_aberta.status == StatusCompetencia.PUBLICADA


def test_publicar_competencia_nao_aberta_e_rejeitada(client, arvore, competencia_aberta, db_session):
    competencia_aberta.status = StatusCompetencia.FECHADA
    db_session.commit()

    resp = client.post(
        f"/competencias/{competencia_aberta.id}/publicar", headers=auth_headers(arvore.admin)
    )
    assert resp.status_code == 409
