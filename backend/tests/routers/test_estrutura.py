from __future__ import annotations

from tests.conftest import auth_headers


def test_criar_empresa_monta_no_estrutura_empresa(client, arvore):
    resp = client.post(
        "/estrutura/empresas",
        json={"razao_social": "Nova Empresa Ltda", "cnpj": "99.888.777/0001-11"},
        headers=auth_headers(arvore.admin),
    )
    assert resp.status_code == 201
    empresa_id = resp.json()["id"]

    arvore_resp = client.get(f"/estrutura/arvore/{empresa_id}", headers=auth_headers(arvore.admin))
    nos = arvore_resp.json()
    assert len(nos) == 1
    assert nos[0]["tipo"] == "EMPRESA"
    assert nos[0]["nome"] == "Nova Empresa Ltda"


def test_listar_empresas_escopo_por_papel(client, arvore):
    client.post(
        "/estrutura/empresas",
        json={"razao_social": "Outra Empresa Ltda", "cnpj": "22.333.444/0001-55"},
        headers=auth_headers(arvore.admin),
    )

    como_admin = client.get("/estrutura/empresas", headers=auth_headers(arvore.admin))
    assert len(como_admin.json()) == 2  # enxerga todas — é global

    como_diretor = client.get("/estrutura/empresas", headers=auth_headers(arvore.diretor))
    nomes = [e["razao_social"] for e in como_diretor.json()]
    assert nomes == [arvore.empresa.razao_social]  # só a própria empresa


def test_criar_empresa_cnpj_duplicado_e_rejeitado(client, arvore):
    resp = client.post(
        "/estrutura/empresas",
        json={"razao_social": "Duplicada Ltda", "cnpj": arvore.empresa.cnpj},
        headers=auth_headers(arvore.admin),
    )
    assert resp.status_code == 409


def test_criar_empresa_exige_admin(client, arvore):
    resp = client.post(
        "/estrutura/empresas",
        json={"razao_social": "Sem Permissão Ltda", "cnpj": "11.111.111/0001-11"},
        headers=auth_headers(arvore.diretor),
    )
    assert resp.status_code == 403


def test_criar_usuario_diretor_sem_unidade_id_e_rejeitado(client, arvore):
    resp = client.post(
        "/estrutura/usuarios",
        json={
            "nome": "Novo Diretor",
            "email": "novo.diretor@aurora.com.br",
            "senha": "senha-forte",
            "papel": "DIRETOR",
        },
        headers=auth_headers(arvore.admin),
    )
    assert resp.status_code == 400


def test_criar_usuario_vendedor_monta_no_ligado_ao_gerente(client, arvore):
    resp = client.post(
        "/estrutura/usuarios",
        json={
            "nome": "Bruno Cardoso",
            "email": "bruno@aurora.com.br",
            "senha": "senha-forte",
            "papel": "VENDEDOR",
            "superior_id": str(arvore.gerente.id),
        },
        headers=auth_headers(arvore.admin),
    )
    assert resp.status_code == 201

    arvore_resp = client.get(
        f"/estrutura/arvore/{arvore.empresa.id}", headers=auth_headers(arvore.admin)
    )
    nos = arvore_resp.json()
    novo_no = next(n for n in nos if n["nome"] == "Bruno Cardoso")
    assert novo_no["tipo"] == "VENDEDOR"
    assert novo_no["no_pai_id"] == str(arvore.no_gerente.id)


def test_listar_produtos_por_empresa(client, arvore):
    resp = client.get(
        "/produtos", params={"empresa_id": str(arvore.empresa.id)}, headers=auth_headers(arvore.admin)
    )
    assert resp.status_code == 200
    nomes = [p["nome"] for p in resp.json()]
    assert "Cafeteira Inox 1.5L" in nomes


def test_listar_competencias_por_empresa(client, arvore, competencia_aberta):
    resp = client.get(
        "/competencias", params={"empresa_id": str(arvore.empresa.id)}, headers=auth_headers(arvore.admin)
    )
    assert resp.status_code == 200
    body = resp.json()
    assert any(c["id"] == str(competencia_aberta.id) for c in body)


def test_arvore_exige_autenticacao(client, arvore):
    resp = client.get(f"/estrutura/arvore/{arvore.empresa.id}")
    assert resp.status_code == 401


def test_arvore_de_outra_empresa_e_bloqueada_para_nao_admin(client, arvore, usuario_outra_empresa):
    resp = client.get(
        f"/estrutura/arvore/{arvore.empresa.id}", headers=auth_headers(usuario_outra_empresa)
    )
    assert resp.status_code == 403


def test_arvore_de_outra_empresa_e_permitida_para_admin(client, arvore):
    resp = client.get(f"/estrutura/arvore/{arvore.empresa.id}", headers=auth_headers(arvore.admin))
    assert resp.status_code == 200


def test_obter_empresa_de_outra_empresa_e_bloqueada_para_nao_admin(client, arvore, usuario_outra_empresa):
    resp = client.get(
        f"/estrutura/empresas/{arvore.empresa.id}", headers=auth_headers(usuario_outra_empresa)
    )
    assert resp.status_code == 403


def test_listar_produtos_de_outra_empresa_e_bloqueada(client, arvore, usuario_outra_empresa):
    resp = client.get(
        "/produtos", params={"empresa_id": str(arvore.empresa.id)}, headers=auth_headers(usuario_outra_empresa)
    )
    assert resp.status_code == 403


def test_listar_competencias_de_outra_empresa_e_bloqueada(
    client, arvore, competencia_aberta, usuario_outra_empresa
):
    resp = client.get(
        "/competencias",
        params={"empresa_id": str(arvore.empresa.id)},
        headers=auth_headers(usuario_outra_empresa),
    )
    assert resp.status_code == 403


def test_obter_competencia_de_outra_empresa_e_bloqueada(client, competencia_aberta, usuario_outra_empresa):
    resp = client.get(
        f"/competencias/{competencia_aberta.id}", headers=auth_headers(usuario_outra_empresa)
    )
    assert resp.status_code == 403
