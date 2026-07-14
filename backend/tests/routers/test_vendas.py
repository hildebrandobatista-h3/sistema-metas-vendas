from __future__ import annotations

from tests.conftest import auth_headers


def _payload_venda(arvore, competencia, numero="V-2026-0001", dia=8):
    return {
        "competencia_id": str(competencia.id),
        "vendedor_no_id": str(arvore.no_vendedor.id),
        "produto_id": str(arvore.produto.id),
        "numero_venda": numero,
        "cliente_nome": "Mercado Bom Preço",
        "data_venda": f"2026-07-{dia:02d}",
        "valor_lancado": "5",
    }


def test_lancar_venda_sucesso(client, arvore, cenario_venda):
    resp = client.post(
        "/vendas",
        json=_payload_venda(arvore, cenario_venda.competencia),
        headers=auth_headers(arvore.vendedor),
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["numero_venda"] == "V-2026-0001"
    assert body["tipo_medida"] == "QUANTIDADE"  # derivado da meta, não do payload
    assert body["origem"] == "MANUAL"


def test_listar_vendas_da_competencia(client, arvore, cenario_venda):
    client.post(
        "/vendas",
        json=_payload_venda(arvore, cenario_venda.competencia),
        headers=auth_headers(arvore.vendedor),
    )

    resp = client.get(
        "/vendas",
        params={
            "competencia_id": str(cenario_venda.competencia.id),
            "vendedor_no_id": str(arvore.no_vendedor.id),
        },
        headers=auth_headers(arvore.vendedor),
    )
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["numero_venda"] == "V-2026-0001"


def test_numero_de_venda_e_unico(client, arvore, cenario_venda):
    payload = _payload_venda(arvore, cenario_venda.competencia, numero="V-2026-0002")
    primeira = client.post("/vendas", json=payload, headers=auth_headers(arvore.vendedor))
    assert primeira.status_code == 201

    payload2 = dict(payload)
    payload2["data_venda"] = "2026-07-09"
    segunda = client.post("/vendas", json=payload2, headers=auth_headers(arvore.vendedor))
    assert segunda.status_code == 409


def test_lancar_venda_sem_meta_publicada_e_bloqueada(client, arvore, competencia_aberta, db_session):
    from app.models.enums import StatusCompetencia

    competencia_aberta.status = StatusCompetencia.PUBLICADA
    db_session.commit()
    # Nenhuma meta foi criada para este nó/produto nesta competência.

    resp = client.post(
        "/vendas",
        json=_payload_venda(arvore, competencia_aberta),
        headers=auth_headers(arvore.vendedor),
    )
    assert resp.status_code == 409


def test_lancar_venda_competencia_nao_publicada_e_bloqueada(client, arvore, competencia_aberta):
    # competencia_aberta continua ABERTA — não PUBLICADA.
    resp = client.post(
        "/vendas",
        json=_payload_venda(arvore, competencia_aberta),
        headers=auth_headers(arvore.vendedor),
    )
    assert resp.status_code == 409


def test_lancar_venda_competencia_fechada_e_bloqueada(client, arvore, cenario_venda, db_session):
    from app.models.enums import StatusCompetencia

    cenario_venda.competencia.status = StatusCompetencia.FECHADA
    db_session.commit()

    resp = client.post(
        "/vendas",
        json=_payload_venda(arvore, cenario_venda.competencia),
        headers=auth_headers(arvore.vendedor),
    )
    assert resp.status_code == 409


def test_lancar_venda_com_data_fora_do_mes_e_bloqueada(client, arvore, cenario_venda):
    payload = _payload_venda(arvore, cenario_venda.competencia)
    payload["data_venda"] = "2026-08-01"  # competência é julho/2026

    resp = client.post("/vendas", json=payload, headers=auth_headers(arvore.vendedor))
    assert resp.status_code == 400


def test_lancar_venda_fora_do_escopo_e_bloqueada(client, arvore, cenario_venda):
    # Vendedor não é ancestral do gerente, então lançar em nome do nó do
    # gerente fica fora do seu escopo (que é só ele mesmo).
    payload = _payload_venda(arvore, cenario_venda.competencia)
    payload["vendedor_no_id"] = str(arvore.no_gerente.id)

    resp = client.post("/vendas", json=payload, headers=auth_headers(arvore.vendedor))
    assert resp.status_code == 403


def test_editar_venda_apenas_admin(client, arvore, cenario_venda):
    venda_resp = client.post(
        "/vendas",
        json=_payload_venda(arvore, cenario_venda.competencia),
        headers=auth_headers(arvore.vendedor),
    )
    venda_id = venda_resp.json()["id"]

    negado = client.put(
        f"/vendas/{venda_id}", json={"valor_lancado": "9"}, headers=auth_headers(arvore.vendedor)
    )
    assert negado.status_code == 403

    permitido = client.put(
        f"/vendas/{venda_id}", json={"valor_lancado": "9"}, headers=auth_headers(arvore.admin)
    )
    assert permitido.status_code == 200
    assert permitido.json()["valor_lancado"] == "9.00"

    historico = client.get(f"/vendas/{venda_id}/historico", headers=auth_headers(arvore.admin))
    linhas = historico.json()
    assert len(linhas) == 1
    assert linhas[0]["acao"] == "EDICAO"
    assert linhas[0]["valor_anterior"] == "5.00"


def test_excluir_venda_apenas_admin_e_definitivo(client, arvore, cenario_venda):
    venda_resp = client.post(
        "/vendas",
        json=_payload_venda(arvore, cenario_venda.competencia),
        headers=auth_headers(arvore.vendedor),
    )
    venda_id = venda_resp.json()["id"]

    negado = client.delete(f"/vendas/{venda_id}", headers=auth_headers(arvore.vendedor))
    assert negado.status_code == 403

    permitido = client.delete(f"/vendas/{venda_id}", headers=auth_headers(arvore.admin))
    assert permitido.status_code == 204

    sumiu = client.get(f"/vendas/{venda_id}", headers=auth_headers(arvore.admin))
    assert sumiu.status_code == 404

    historico = client.get(f"/vendas/{venda_id}/historico", headers=auth_headers(arvore.admin))
    linhas = historico.json()
    assert len(linhas) == 1
    assert linhas[0]["acao"] == "EXCLUSAO"
    assert linhas[0]["valor_anterior"] == "5.00"


def test_editar_venda_em_competencia_fechada_e_bloqueada(client, arvore, cenario_venda, db_session):
    from app.models.enums import StatusCompetencia

    venda_resp = client.post(
        "/vendas",
        json=_payload_venda(arvore, cenario_venda.competencia),
        headers=auth_headers(arvore.vendedor),
    )
    venda_id = venda_resp.json()["id"]

    cenario_venda.competencia.status = StatusCompetencia.FECHADA
    db_session.commit()

    resp = client.put(
        f"/vendas/{venda_id}", json={"valor_lancado": "9"}, headers=auth_headers(arvore.admin)
    )
    assert resp.status_code == 409
