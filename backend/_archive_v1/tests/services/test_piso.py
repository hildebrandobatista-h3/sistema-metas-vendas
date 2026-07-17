from __future__ import annotations

from decimal import Decimal

from app.models.enums import StatusMeta, TipoMedida
from app.models.meta import Meta
from app.services.piso import verificar_piso_meta, verificar_piso_no


def _criar_meta(db_session, competencia, estrutura_no_id, produto_id, valor, status=StatusMeta.RASCUNHO):
    meta = Meta(
        competencia_id=competencia.id,
        estrutura_no_id=estrutura_no_id,
        produto_id=produto_id,
        tipo_medida=TipoMedida.VALOR,
        valor_meta=Decimal(valor),
        status=status,
    )
    db_session.add(meta)
    db_session.commit()
    db_session.refresh(meta)
    return meta


def test_no_folha_sem_filhos_nao_tem_regra_de_piso(db_session, arvore, competencia_aberta):
    # Vendedor é nó-folha: não tem filhos, então piso não se aplica a ele.
    meta_vendedor = _criar_meta(
        db_session, competencia_aberta, arvore.no_vendedor.id, arvore.produto.id, "10000.00"
    )
    violacao = verificar_piso_meta(db_session, meta_vendedor)
    assert violacao is None


def test_no_sem_meta_propria_nao_gera_violacao(db_session, arvore, competencia_aberta):
    # Gerente não tem meta própria para o produto — nada a validar.
    violacao = verificar_piso_no(
        db_session, competencia_aberta.id, arvore.no_gerente.id, arvore.produto.id
    )
    assert violacao is None


def test_soma_dos_filhos_insuficiente_gera_violacao_com_gap_correto(db_session, arvore, competencia_aberta):
    _criar_meta(db_session, competencia_aberta, arvore.no_gerente.id, arvore.produto.id, "50000.00")
    _criar_meta(db_session, competencia_aberta, arvore.no_vendedor.id, arvore.produto.id, "42000.00")

    violacao = verificar_piso_no(
        db_session, competencia_aberta.id, arvore.no_gerente.id, arvore.produto.id
    )

    assert violacao is not None
    assert violacao.meta_pai == Decimal("50000.00")
    assert violacao.soma_filhos == Decimal("42000.00")
    assert violacao.gap == Decimal("8000.00")


def test_soma_dos_filhos_suficiente_nao_gera_violacao(db_session, arvore, competencia_aberta):
    _criar_meta(db_session, competencia_aberta, arvore.no_gerente.id, arvore.produto.id, "50000.00")
    _criar_meta(db_session, competencia_aberta, arvore.no_vendedor.id, arvore.produto.id, "50000.00")

    violacao = verificar_piso_no(
        db_session, competencia_aberta.id, arvore.no_gerente.id, arvore.produto.id
    )

    assert violacao is None


def test_soma_dos_filhos_exatamente_no_piso_nao_gera_violacao(db_session, arvore, competencia_aberta):
    # Regra é "soma dos filhos >= meta do pai" — empatar deve passar, não bloquear.
    _criar_meta(db_session, competencia_aberta, arvore.no_gerente.id, arvore.produto.id, "50000.00")
    _criar_meta(db_session, competencia_aberta, arvore.no_vendedor.id, arvore.produto.id, "50000.00")

    violacao = verificar_piso_no(
        db_session, competencia_aberta.id, arvore.no_gerente.id, arvore.produto.id
    )

    assert violacao is None
