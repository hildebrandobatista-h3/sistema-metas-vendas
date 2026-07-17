from __future__ import annotations

from decimal import Decimal

from app.models.enums import StatusCompetencia
from tests.conftest import auth_headers


def _payload_meta(arvore, competencia, no, valor="50000.00"):
    return {
        "competencia_id": str(competencia.id),
        "estrutura_no_id": str(no.id),
        "produto_id": str(arvore.produto.id),
        "tipo_medida": "VALOR",
        "valor_meta": valor,
    }


def test_criar_meta_sucesso(client, arvore, competencia_aberta):
    resp = client.post(
        "/metas",
        json=_payload_meta(arvore, competencia_aberta, arvore.no_gerente),
        headers=auth_headers(arvore.gerente),
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "RASCUNHO"
    assert body["valor_meta"] == "50000.00"


def test_buscar_meta_por_chave_natural(client, arvore, competencia_aberta):
    client.post(
        "/metas",
        json=_payload_meta(arvore, competencia_aberta, arvore.no_gerente),
        headers=auth_headers(arvore.gerente),
    )

    resp = client.get(
        "/metas",
        params={
            "competencia_id": str(competencia_aberta.id),
            "estrutura_no_id": str(arvore.no_gerente.id),
            "produto_id": str(arvore.produto.id),
        },
        headers=auth_headers(arvore.gerente),
    )
    assert resp.status_code == 200
    assert resp.json()["valor_meta"] == "50000.00"


def test_buscar_meta_inexistente_retorna_404(client, arvore, competencia_aberta):
    resp = client.get(
        "/metas",
        params={
            "competencia_id": str(competencia_aberta.id),
            "estrutura_no_id": str(arvore.no_gerente.id),
            "produto_id": str(arvore.produto.id),
        },
        headers=auth_headers(arvore.gerente),
    )
    assert resp.status_code == 404


def test_criar_meta_fora_do_escopo_e_bloqueada(client, arvore, competencia_aberta):
    # Vendedor não pode criar meta para o nó do gerente (fora da sua subárvore, que é só ele mesmo).
    resp = client.post(
        "/metas",
        json=_payload_meta(arvore, competencia_aberta, arvore.no_gerente),
        headers=auth_headers(arvore.vendedor),
    )
    assert resp.status_code == 403


def test_meta_duplicada_para_mesma_competencia_no_produto_e_rejeitada(client, arvore, competencia_aberta):
    payload = _payload_meta(arvore, competencia_aberta, arvore.no_vendedor)
    primeira = client.post("/metas", json=payload, headers=auth_headers(arvore.vendedor))
    assert primeira.status_code == 201

    segunda = client.post("/metas", json=payload, headers=auth_headers(arvore.vendedor))
    assert segunda.status_code == 409


def test_criar_meta_em_competencia_fechada_e_bloqueada(client, arvore, competencia_aberta, db_session):
    competencia_aberta.status = StatusCompetencia.FECHADA
    db_session.commit()

    resp = client.post(
        "/metas",
        json=_payload_meta(arvore, competencia_aberta, arvore.no_vendedor),
        headers=auth_headers(arvore.vendedor),
    )
    assert resp.status_code == 409


def test_publicar_meta_bloqueada_por_piso(client, arvore, competencia_aberta):
    meta_resp = client.post(
        "/metas",
        json=_payload_meta(arvore, competencia_aberta, arvore.no_gerente, valor="50000.00"),
        headers=auth_headers(arvore.gerente),
    )
    meta_id = meta_resp.json()["id"]

    client.post(
        "/metas",
        json=_payload_meta(arvore, competencia_aberta, arvore.no_vendedor, valor="42000.00"),
        headers=auth_headers(arvore.vendedor),
    )

    resp = client.post(f"/metas/{meta_id}/publicar", headers=auth_headers(arvore.gerente))
    assert resp.status_code == 200
    body = resp.json()
    assert body["publicada"] is False
    assert body["gap"] == "8000.00"


def test_publicar_meta_sucesso_quando_piso_atendido(client, arvore, competencia_aberta):
    meta_resp = client.post(
        "/metas",
        json=_payload_meta(arvore, competencia_aberta, arvore.no_gerente, valor="50000.00"),
        headers=auth_headers(arvore.gerente),
    )
    meta_id = meta_resp.json()["id"]

    client.post(
        "/metas",
        json=_payload_meta(arvore, competencia_aberta, arvore.no_vendedor, valor="50000.00"),
        headers=auth_headers(arvore.vendedor),
    )

    resp = client.post(f"/metas/{meta_id}/publicar", headers=auth_headers(arvore.gerente))
    assert resp.status_code == 200
    assert resp.json()["publicada"] is True

    verifica = client.get(f"/metas/{meta_id}", headers=auth_headers(arvore.gerente))
    assert verifica.json()["status"] == "PUBLICADA"


def test_publicar_meta_folha_sem_piso_sempre_permitido(client, arvore, competencia_aberta):
    meta_resp = client.post(
        "/metas",
        json=_payload_meta(arvore, competencia_aberta, arvore.no_vendedor, valor="10000.00"),
        headers=auth_headers(arvore.vendedor),
    )
    meta_id = meta_resp.json()["id"]

    resp = client.post(f"/metas/{meta_id}/publicar", headers=auth_headers(arvore.vendedor))
    assert resp.status_code == 200
    assert resp.json()["publicada"] is True


def test_atualizar_meta_grava_historico(client, arvore, competencia_aberta):
    meta_resp = client.post(
        "/metas",
        json=_payload_meta(arvore, competencia_aberta, arvore.no_vendedor, valor="10000.00"),
        headers=auth_headers(arvore.vendedor),
    )
    meta_id = meta_resp.json()["id"]

    resp = client.put(
        f"/metas/{meta_id}",
        json={"valor_meta": "12000.00", "motivo": "Revisão de orçamento trimestral"},
        headers=auth_headers(arvore.vendedor),
    )
    assert resp.status_code == 200
    assert resp.json()["valor_meta"] == "12000.00"

    historico = client.get(f"/metas/{meta_id}/historico", headers=auth_headers(arvore.vendedor))
    linhas = historico.json()
    # uma linha da criação + uma da atualização
    assert len(linhas) == 2
    ultima = linhas[-1]
    assert ultima["valor_anterior"] == "10000.00"
    assert ultima["valor_novo"] == "12000.00"
    assert ultima["motivo"] == "Revisão de orçamento trimestral"


def test_excluir_meta_sucesso(client, arvore, competencia_aberta):
    meta_resp = client.post(
        "/metas",
        json=_payload_meta(arvore, competencia_aberta, arvore.no_vendedor, valor="10000.00"),
        headers=auth_headers(arvore.vendedor),
    )
    meta_id = meta_resp.json()["id"]

    resp = client.delete(f"/metas/{meta_id}", headers=auth_headers(arvore.vendedor))
    assert resp.status_code == 204

    verifica = client.get(f"/metas/{meta_id}", headers=auth_headers(arvore.vendedor))
    assert verifica.status_code == 404


def test_excluir_meta_publicada_e_bloqueada(client, arvore, competencia_aberta):
    meta_resp = client.post(
        "/metas",
        json=_payload_meta(arvore, competencia_aberta, arvore.no_vendedor, valor="10000.00"),
        headers=auth_headers(arvore.vendedor),
    )
    meta_id = meta_resp.json()["id"]
    client.post(f"/metas/{meta_id}/publicar", headers=auth_headers(arvore.vendedor))

    resp = client.delete(f"/metas/{meta_id}", headers=auth_headers(arvore.vendedor))
    assert resp.status_code == 409


def test_excluir_meta_em_competencia_fechada_e_bloqueada(client, arvore, competencia_aberta, db_session):
    meta_resp = client.post(
        "/metas",
        json=_payload_meta(arvore, competencia_aberta, arvore.no_vendedor, valor="10000.00"),
        headers=auth_headers(arvore.vendedor),
    )
    meta_id = meta_resp.json()["id"]

    competencia_aberta.status = StatusCompetencia.FECHADA
    db_session.commit()

    resp = client.delete(f"/metas/{meta_id}", headers=auth_headers(arvore.vendedor))
    assert resp.status_code == 409


def test_excluir_meta_fora_do_escopo_e_bloqueada(client, arvore, competencia_aberta):
    meta_resp = client.post(
        "/metas",
        json=_payload_meta(arvore, competencia_aberta, arvore.no_gerente, valor="10000.00"),
        headers=auth_headers(arvore.gerente),
    )
    meta_id = meta_resp.json()["id"]

    resp = client.delete(f"/metas/{meta_id}", headers=auth_headers(arvore.vendedor))
    assert resp.status_code == 403


def test_meta_e_somente_leitura_apos_fechamento_da_competencia(
    client, arvore, competencia_aberta, db_session
):
    meta_resp = client.post(
        "/metas",
        json=_payload_meta(arvore, competencia_aberta, arvore.no_vendedor, valor="10000.00"),
        headers=auth_headers(arvore.vendedor),
    )
    meta_id = meta_resp.json()["id"]

    competencia_aberta.status = StatusCompetencia.FECHADA
    db_session.commit()

    resp_update = client.put(
        f"/metas/{meta_id}",
        json={"valor_meta": "99999.00"},
        headers=auth_headers(arvore.vendedor),
    )
    assert resp_update.status_code == 409

    resp_publicar = client.post(f"/metas/{meta_id}/publicar", headers=auth_headers(arvore.vendedor))
    assert resp_publicar.status_code == 409
