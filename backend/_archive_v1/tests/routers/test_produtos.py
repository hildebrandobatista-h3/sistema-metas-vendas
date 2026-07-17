from __future__ import annotations

from tests.conftest import auth_headers


def test_criar_produto_exige_admin(client, arvore):
    resp = client.post(
        "/produtos",
        json={"empresa_id": str(arvore.empresa.id), "nome": "Liquidificador 900W"},
        headers=auth_headers(arvore.diretor),
    )
    assert resp.status_code == 403


def test_criar_e_listar_produto_sucesso(client, arvore):
    resp = client.post(
        "/produtos",
        json={"empresa_id": str(arvore.empresa.id), "nome": "Liquidificador 900W"},
        headers=auth_headers(arvore.admin),
    )
    assert resp.status_code == 201

    listagem = client.get(
        "/produtos", params={"empresa_id": str(arvore.empresa.id)}, headers=auth_headers(arvore.admin)
    )
    nomes = [p["nome"] for p in listagem.json()]
    assert "Liquidificador 900W" in nomes


def test_listar_produtos_de_outra_empresa_e_bloqueada_para_nao_admin(client, arvore, usuario_outra_empresa):
    resp = client.get(
        "/produtos",
        params={"empresa_id": str(arvore.empresa.id)},
        headers=auth_headers(usuario_outra_empresa),
    )
    assert resp.status_code == 403


def test_listar_produtos_da_propria_empresa_e_permitida(client, arvore):
    resp = client.get(
        "/produtos", params={"empresa_id": str(arvore.empresa.id)}, headers=auth_headers(arvore.gerente)
    )
    assert resp.status_code == 200
