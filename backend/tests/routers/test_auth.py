from __future__ import annotations

from tests.conftest import auth_headers


def test_login_sucesso(client, arvore):
    resp = client.post(
        "/auth/login", data={"username": "fernanda@aurora.com.br", "password": "senha-forte"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_senha_incorreta(client, arvore):
    resp = client.post(
        "/auth/login", data={"username": "fernanda@aurora.com.br", "password": "senha-errada"}
    )
    assert resp.status_code == 401


def test_acesso_sem_token_e_rejeitado(client):
    resp = client.get("/produtos/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 401


def test_me_retorna_dados_do_usuario_e_seu_no_de_estrutura(client, arvore):
    resp = client.get("/auth/me", headers=auth_headers(arvore.vendedor))
    assert resp.status_code == 200
    body = resp.json()
    assert body["nome"] == "Camila Nogueira"
    assert body["papel"] == "VENDEDOR"
    assert body["estrutura_no_id"] == str(arvore.no_vendedor.id)


def test_me_admin_nao_tem_no_de_estrutura(client, arvore):
    resp = client.get("/auth/me", headers=auth_headers(arvore.admin))
    assert resp.status_code == 200
    assert resp.json()["estrutura_no_id"] is None
