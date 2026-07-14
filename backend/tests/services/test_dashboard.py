from __future__ import annotations

from datetime import date
from decimal import Decimal

from app.models.competencia import Competencia
from app.models.enums import StatusCompetencia, StatusMeta, TipoMedida
from app.models.meta import Meta
from app.models.venda import Venda
from app.services.dashboard import comparacao_yoy, evolucao, indicadores_filhos


def _competencia(db_session, empresa_id, ano, mes, status=StatusCompetencia.PUBLICADA):
    c = Competencia(empresa_id=empresa_id, ano=ano, mes=mes, status=status)
    db_session.add(c)
    db_session.commit()
    return c


def _meta(db_session, competencia, no_id, produto_id, valor, status=StatusMeta.PUBLICADA):
    m = Meta(
        competencia_id=competencia.id,
        estrutura_no_id=no_id,
        produto_id=produto_id,
        tipo_medida=TipoMedida.QUANTIDADE,
        valor_meta=Decimal(valor),
        status=status,
    )
    db_session.add(m)
    db_session.commit()
    return m


def _venda(db_session, competencia, no_id, produto_id, valor, numero, lancado_por, dia=15):
    v = Venda(
        competencia_id=competencia.id,
        vendedor_no_id=no_id,
        produto_id=produto_id,
        numero_venda=numero,
        cliente_nome="Cliente Teste",
        data_venda=date(competencia.ano, competencia.mes, dia),
        tipo_medida=TipoMedida.QUANTIDADE,
        valor_lancado=Decimal(valor),
        lancado_por=lancado_por,
    )
    db_session.add(v)
    db_session.commit()
    return v


def test_evolucao_acumula_soma_e_nao_faz_media_de_percentuais(db_session, arvore):
    # Junho: meta 100, realizado 10 -> 10% no mês isolado.
    junho = _competencia(db_session, arvore.empresa.id, 2026, 6)
    _meta(db_session, junho, arvore.no_vendedor.id, arvore.produto.id, "100")
    _venda(db_session, junho, arvore.no_vendedor.id, arvore.produto.id, "10", "V-JUN-1", arvore.vendedor.id)

    # Julho: meta 10, realizado 10 -> 100% no mês isolado.
    julho = _competencia(db_session, arvore.empresa.id, 2026, 7)
    _meta(db_session, julho, arvore.no_vendedor.id, arvore.produto.id, "10")
    _venda(db_session, julho, arvore.no_vendedor.id, arvore.produto.id, "10", "V-JUL-1", arvore.vendedor.id)

    pontos = evolucao(
        db_session, arvore.empresa.id, arvore.no_vendedor.id, arvore.produto.id, 2026, 6, 7
    )

    assert len(pontos) == 2
    assert pontos[0].meta_acumulada == Decimal("100")
    assert pontos[0].realizado_acumulado == Decimal("10")

    ultimo = pontos[1]
    assert ultimo.meta_acumulada == Decimal("110")
    assert ultimo.realizado_acumulado == Decimal("20")
    # soma/soma: 20/110 = 18.18% — bem diferente da média simples dos meses
    # (10% + 100%) / 2 = 55%, que seria a conta errada (proibida no escopo).
    assert ultimo.percentual == Decimal("18.18")
    media_simples_errada = Decimal("55.00")
    assert ultimo.percentual != media_simples_errada


def test_indicadores_filhos_traz_meta_propria_e_realizado_da_subarvore(db_session, arvore, competencia_aberta):
    _meta(db_session, competencia_aberta, arvore.no_gerente.id, arvore.produto.id, "50")
    _meta(db_session, competencia_aberta, arvore.no_vendedor.id, arvore.produto.id, "40")
    _venda(db_session, competencia_aberta, arvore.no_vendedor.id, arvore.produto.id, "30", "V-1", arvore.vendedor.id)

    filhos_do_diretor = indicadores_filhos(
        db_session, arvore.no_diretor.id, competencia_aberta.id, arvore.produto.id
    )
    assert len(filhos_do_diretor) == 1
    gerente_ind = filhos_do_diretor[0]
    assert gerente_ind.estrutura_no_id == arvore.no_gerente.id
    assert gerente_ind.meta == Decimal("50")  # meta própria do gerente
    assert gerente_ind.realizado == Decimal("30")  # subiu da venda do vendedor

    filhos_do_gerente = indicadores_filhos(
        db_session, arvore.no_gerente.id, competencia_aberta.id, arvore.produto.id
    )
    assert len(filhos_do_gerente) == 1
    vendedor_ind = filhos_do_gerente[0]
    assert vendedor_ind.meta == Decimal("40")
    assert vendedor_ind.realizado == Decimal("30")


def test_yoy_nasce_vazio_sem_historico_do_ano_anterior(db_session, arvore, competencia_aberta):
    _meta(db_session, competencia_aberta, arvore.no_vendedor.id, arvore.produto.id, "40")
    _venda(db_session, competencia_aberta, arvore.no_vendedor.id, arvore.produto.id, "30", "V-1", arvore.vendedor.id)

    comparacao = comparacao_yoy(
        db_session, arvore.empresa.id, arvore.no_vendedor.id, arvore.produto.id, 2026, 7, 7
    )

    assert comparacao.atual.tem_dado is True
    assert comparacao.atual.meta == Decimal("40")
    assert comparacao.atual.realizado == Decimal("30")

    assert comparacao.anterior.tem_dado is False
    assert comparacao.anterior.meta == Decimal("0")
    assert comparacao.anterior.percentual is None


def test_yoy_preenche_conforme_historico_e_digitado(db_session, arvore, competencia_aberta):
    _meta(db_session, competencia_aberta, arvore.no_vendedor.id, arvore.produto.id, "40")
    _venda(db_session, competencia_aberta, arvore.no_vendedor.id, arvore.produto.id, "30", "V-1", arvore.vendedor.id)

    julho_2025 = _competencia(db_session, arvore.empresa.id, 2025, 7)
    _meta(db_session, julho_2025, arvore.no_vendedor.id, arvore.produto.id, "20")
    _venda(db_session, julho_2025, arvore.no_vendedor.id, arvore.produto.id, "18", "V-2025-1", arvore.vendedor.id)

    comparacao = comparacao_yoy(
        db_session, arvore.empresa.id, arvore.no_vendedor.id, arvore.produto.id, 2026, 7, 7
    )

    assert comparacao.anterior.tem_dado is True
    assert comparacao.anterior.meta == Decimal("20")
    assert comparacao.anterior.realizado == Decimal("18")


def test_percentual_e_none_quando_no_nao_tem_meta(db_session, arvore, competencia_aberta):
    filhos = indicadores_filhos(
        db_session, arvore.no_gerente.id, competencia_aberta.id, arvore.produto.id
    )
    assert filhos[0].meta == Decimal("0")
    assert filhos[0].percentual is None
