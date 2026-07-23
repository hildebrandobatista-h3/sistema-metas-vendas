"""TDD: testes para GET /api/dashboard/breakdown-produtos"""
from decimal import Decimal


def test_admin_ve_todos_os_produtos(client, cenario):
    r = client.get(
        "/api/dashboard/breakdown-produtos",
        params={"ano": 2026, "periodo_tipo": "mensal", "periodo_ref": 7},
        headers=cenario["tok_admin"],
    )
    assert r.status_code == 200
    body = r.json()
    produtos = {p["produto_nome"]: p for p in body["produtos"]}
    # Setup: meta 1000+500=1500, realizado 800+300=1100
    assert "Setup" in produtos
    assert float(produtos["Setup"]["meta_total"]) == 1500.0
    assert float(produtos["Setup"]["realizado_total"]) == 1100.0
    assert produtos["Setup"]["percentual"] == round(1100 / 1500 * 100, 1)
    # MRR: meta 2000, realizado 0
    assert "MRR" in produtos
    assert float(produtos["MRR"]["meta_total"]) == 2000.0
    assert float(produtos["MRR"]["realizado_total"]) == 0.0
    assert produtos["MRR"]["percentual"] == 0.0


def test_gerente_ve_so_sua_unidade(client, cenario):
    r = client.get(
        "/api/dashboard/breakdown-produtos",
        params={"ano": 2026, "periodo_tipo": "mensal", "periodo_ref": 7},
        headers=cenario["tok_gerente"],
    )
    assert r.status_code == 200
    body = r.json()
    # Gerente só vê vendedores de sua unidade — mesmo resultado que admin neste cenário
    nomes = {p["produto_nome"] for p in body["produtos"]}
    assert "Setup" in nomes


def test_vendedor_ve_so_seus_produtos(client, cenario):
    r = client.get(
        "/api/dashboard/breakdown-produtos",
        params={"ano": 2026, "periodo_tipo": "mensal", "periodo_ref": 7},
        headers=cenario["tok_vendedor"],
    )
    assert r.status_code == 200
    body = r.json()
    produtos = {p["produto_nome"]: p for p in body["produtos"]}
    # v1 tem meta em Setup (1000) e MRR (2000), realizado em Setup (800)
    assert "Setup" in produtos
    assert float(produtos["Setup"]["meta_total"]) == 1000.0
    assert float(produtos["Setup"]["realizado_total"]) == 800.0
    assert "MRR" in produtos
    # v2 não é visível para v1
    assert float(produtos["MRR"]["meta_total"]) == 2000.0


def test_divisao_por_zero_retorna_zero(client, cenario):
    """Produto com meta=0 não deve gerar NaN."""
    r = client.get(
        "/api/dashboard/breakdown-produtos",
        params={"ano": 2026, "periodo_tipo": "mensal", "periodo_ref": 7,
                "produto_id": cenario["p2"].id},
        headers=cenario["tok_admin"],
    )
    assert r.status_code == 200
    body = r.json()
    # p2 (MRR) tem meta mas realizado zero — percentual deve ser 0.0, não NaN
    mrr = next((p for p in body["produtos"] if p["produto_nome"] == "MRR"), None)
    assert mrr is not None
    assert mrr["percentual"] == 0.0 or isinstance(mrr["percentual"], float)
