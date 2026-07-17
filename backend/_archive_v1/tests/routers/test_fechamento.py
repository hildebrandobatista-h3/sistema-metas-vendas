from __future__ import annotations

from app.models.enums import StatusCompetencia
from tests.conftest import auth_headers


def test_fechar_competencia_sucesso(client, arvore, cenario_venda):
    resp = client.post(
        f"/competencias/{cenario_venda.competencia.id}/fechar", headers=auth_headers(arvore.admin)
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "FECHADA"

    eventos = client.get(
        f"/competencias/{cenario_venda.competencia.id}/eventos", headers=auth_headers(arvore.admin)
    ).json()
    assert len(eventos) == 1
    assert eventos[0]["acao"] == "FECHOU"


def test_fechar_competencia_fora_do_status_valido_e_rejeitada(client, arvore, competencia_aberta):
    # competencia_aberta está ABERTA, não PUBLICADA — não pode ir direto pra FECHADA.
    resp = client.post(f"/competencias/{competencia_aberta.id}/fechar", headers=auth_headers(arvore.admin))
    assert resp.status_code == 409


def test_fechar_competencia_exige_admin(client, arvore, cenario_venda):
    resp = client.post(
        f"/competencias/{cenario_venda.competencia.id}/fechar", headers=auth_headers(arvore.gerente)
    )
    assert resp.status_code == 403


def test_reabrir_exige_motivo(client, arvore, cenario_venda, db_session):
    cenario_venda.competencia.status = StatusCompetencia.FECHADA
    db_session.commit()

    resp = client.post(
        f"/competencias/{cenario_venda.competencia.id}/reabrir", json={}, headers=auth_headers(arvore.admin)
    )
    assert resp.status_code == 422


def test_reabrir_sucesso_volta_para_publicada_e_audita(client, arvore, cenario_venda, db_session):
    cenario_venda.competencia.status = StatusCompetencia.FECHADA
    db_session.commit()

    resp = client.post(
        f"/competencias/{cenario_venda.competencia.id}/reabrir",
        json={"motivo": "Venda esquecida do dia 28/06 — nota fiscal atrasada"},
        headers=auth_headers(arvore.admin),
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "PUBLICADA"

    eventos = client.get(
        f"/competencias/{cenario_venda.competencia.id}/eventos", headers=auth_headers(arvore.admin)
    ).json()
    reaberturas = [e for e in eventos if e["acao"] == "REABRIU"]
    assert len(reaberturas) == 1
    assert "esquecida" in reaberturas[0]["observacao"]


def test_reabrir_apenas_de_fechada(client, arvore, cenario_venda):
    # cenario_venda já está PUBLICADA, não FECHADA.
    resp = client.post(
        f"/competencias/{cenario_venda.competencia.id}/reabrir",
        json={"motivo": "teste"},
        headers=auth_headers(arvore.admin),
    )
    assert resp.status_code == 409


def test_venda_bloqueada_apos_fechamento_e_liberada_apos_reabertura(client, arvore, cenario_venda):
    payload = {
        "competencia_id": str(cenario_venda.competencia.id),
        "vendedor_no_id": str(arvore.no_vendedor.id),
        "produto_id": str(arvore.produto.id),
        "numero_venda": "V-2026-9000",
        "cliente_nome": "Cliente Esquecido",
        "data_venda": "2026-07-28",
        "valor_lancado": "3",
    }

    client.post(f"/competencias/{cenario_venda.competencia.id}/fechar", headers=auth_headers(arvore.admin))

    bloqueado = client.post("/vendas", json=payload, headers=auth_headers(arvore.vendedor))
    assert bloqueado.status_code == 409

    client.post(
        f"/competencias/{cenario_venda.competencia.id}/reabrir",
        json={"motivo": "nota fiscal chegou atrasada"},
        headers=auth_headers(arvore.admin),
    )

    liberado = client.post("/vendas", json=payload, headers=auth_headers(arvore.vendedor))
    assert liberado.status_code == 201
