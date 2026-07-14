from __future__ import annotations

from datetime import date
from decimal import Decimal

from app.models.enums import StatusMeta, TipoMedida
from app.models.meta import Meta
from app.models.venda import Venda
from tests.conftest import auth_headers


def test_nivel_retorna_ranking_ordenado_por_percentual(db_session, client, arvore, competencia_aberta):
    db_session.add_all(
        [
            Meta(
                competencia_id=competencia_aberta.id,
                estrutura_no_id=arvore.no_gerente.id,
                produto_id=arvore.produto.id,
                tipo_medida=TipoMedida.QUANTIDADE,
                valor_meta=Decimal("100"),
                status=StatusMeta.PUBLICADA,
            ),
            Venda(
                competencia_id=competencia_aberta.id,
                vendedor_no_id=arvore.no_gerente.id,
                produto_id=arvore.produto.id,
                numero_venda="V-DASH-1",
                cliente_nome="Cliente",
                data_venda=date(2026, 7, 10),
                tipo_medida=TipoMedida.QUANTIDADE,
                valor_lancado=Decimal("80"),
                lancado_por=arvore.gerente.id,
            ),
        ]
    )
    db_session.commit()

    resp = client.get(
        "/dashboard/nivel/" + str(arvore.no_diretor.id),
        params={"competencia_id": str(competencia_aberta.id), "produto_id": str(arvore.produto.id)},
        headers=auth_headers(arvore.diretor),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == 1
    assert body[0]["estrutura_no_id"] == str(arvore.no_gerente.id)
    assert body[0]["meta"] == "100.00"
    assert body[0]["realizado"] == "80.00"
    assert body[0]["percentual"] == "80.00"


def test_nivel_fora_do_escopo_e_bloqueado(client, arvore, competencia_aberta):
    resp = client.get(
        "/dashboard/nivel/" + str(arvore.no_diretor.id),
        params={"competencia_id": str(competencia_aberta.id), "produto_id": str(arvore.produto.id)},
        headers=auth_headers(arvore.vendedor),
    )
    assert resp.status_code == 403


def test_alertas_gap_reaproveita_regra_de_piso(db_session, client, arvore, competencia_aberta):
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

    resp = client.get(
        f"/dashboard/alertas-gap/{competencia_aberta.id}", headers=auth_headers(arvore.admin)
    )
    assert resp.status_code == 200
    violacoes = resp.json()
    assert len(violacoes) == 1
    assert violacoes[0]["gap"] == "8000.00"


def test_alertas_gap_exige_admin(client, arvore, competencia_aberta):
    resp = client.get(
        f"/dashboard/alertas-gap/{competencia_aberta.id}", headers=auth_headers(arvore.gerente)
    )
    assert resp.status_code == 403


def test_evolucao_via_http(db_session, client, arvore, competencia_aberta):
    db_session.add_all(
        [
            Meta(
                competencia_id=competencia_aberta.id,
                estrutura_no_id=arvore.no_vendedor.id,
                produto_id=arvore.produto.id,
                tipo_medida=TipoMedida.QUANTIDADE,
                valor_meta=Decimal("10"),
                status=StatusMeta.PUBLICADA,
            ),
            Venda(
                competencia_id=competencia_aberta.id,
                vendedor_no_id=arvore.no_vendedor.id,
                produto_id=arvore.produto.id,
                numero_venda="V-DASH-2",
                cliente_nome="Cliente",
                data_venda=date(2026, 7, 10),
                tipo_medida=TipoMedida.QUANTIDADE,
                valor_lancado=Decimal("10"),
                lancado_por=arvore.vendedor.id,
            ),
        ]
    )
    db_session.commit()

    resp = client.get(
        "/dashboard/evolucao",
        params={
            "empresa_id": str(arvore.empresa.id),
            "no_id": str(arvore.no_vendedor.id),
            "produto_id": str(arvore.produto.id),
            "ano": 2026,
            "mes_inicio": 7,
            "mes_fim": 7,
        },
        headers=auth_headers(arvore.vendedor),
    )
    assert resp.status_code == 200
    pontos = resp.json()
    assert len(pontos) == 1
    assert pontos[0]["percentual"] == "100.00"
