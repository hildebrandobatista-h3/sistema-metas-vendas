from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, extract
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import usuario_atual, vendedores_visiveis
from ..models import Meta, Realizado, Periodo, Vendedor, Produto, Usuario
from ..schemas.movimento import DashboardResposta, LinhaAtingimento, LinhaProdutoBreakdown, BreakdownProdutosResposta

router = APIRouter(tags=["dashboard"])


def _meses_do_periodo(tipo: str, ref: int) -> list[int]:
    if tipo == "mensal":
        if not 1 <= ref <= 12:
            raise HTTPException(422, "mes deve ser 1..12")
        return [ref]
    if tipo == "trimestre":
        if not 1 <= ref <= 4:
            raise HTTPException(422, "trimestre deve ser 1..4")
        base = (ref - 1) * 3
        return [base + 1, base + 2, base + 3]
    if tipo == "semestre":
        if not 1 <= ref <= 2:
            raise HTTPException(422, "semestre deve ser 1..2")
        base = (ref - 1) * 6
        return list(range(base + 1, base + 7))
    if tipo == "anual":
        return list(range(1, 13))
    raise HTTPException(422, "periodo_tipo invalido (use mensal|trimestre|semestre|anual)")


def _pct(meta: Decimal, real: Decimal) -> float:
    if meta and meta > 0:
        return round(float(real) / float(meta) * 100, 1)
    return 0.0


@router.get("/dashboard", response_model=DashboardResposta)
def dashboard(ano: int, periodo_tipo: str = Query("mensal"), periodo_ref: int = Query(...),
              empresa_id: int | None = None, unidade_id: int | None = None,
              gerente_id: int | None = None, produto_id: int | None = None,
              vendedor_id: int | None = None, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    meses = _meses_do_periodo(periodo_tipo, periodo_ref)

    vis = vendedores_visiveis(db, u)
    if vis is not None and not vis:
        return DashboardResposta(ano=ano, periodo_tipo=periodo_tipo, periodo_ref=periodo_ref,
                                 meses=meses, meta_total=0, realizado_total=0,
                                 percentual_total=0.0, linhas=[])

    def _filtros(stmt, model):
        if empresa_id is not None:
            stmt = stmt.where(model.empresa_id == empresa_id)
        if unidade_id is not None:
            stmt = stmt.where(model.unidade_id == unidade_id)
        if gerente_id is not None:
            stmt = stmt.where(model.gerente_id == gerente_id)
        if produto_id is not None:
            stmt = stmt.where(model.produto_id == produto_id)
        if vendedor_id is not None:
            stmt = stmt.where(model.vendedor_id == vendedor_id)
        if vis is not None:
            stmt = stmt.where(model.vendedor_id.in_(vis))
        return stmt

    meta_stmt = (select(Meta.vendedor_id, Meta.produto_id, func.sum(Meta.valor))
                 .join(Periodo, Meta.periodo_id == Periodo.id)
                 .where(Meta.ativo.is_(True), Periodo.ano == ano, Periodo.mes.in_(meses))
                 .group_by(Meta.vendedor_id, Meta.produto_id))
    meta_stmt = _filtros(meta_stmt, Meta)
    metas = {(v, p): (val or Decimal(0)) for v, p, val in db.execute(meta_stmt).all()}

    real_stmt = (select(Realizado.vendedor_id, Realizado.produto_id, func.sum(Realizado.valor))
                 .where(Realizado.ativo.is_(True),
                        extract("year", Realizado.data_venda) == ano,
                        extract("month", Realizado.data_venda).in_(meses))
                 .group_by(Realizado.vendedor_id, Realizado.produto_id))
    real_stmt = _filtros(real_stmt, Realizado)
    reals = {(v, p): (val or Decimal(0)) for v, p, val in db.execute(real_stmt).all()}

    chaves = set(metas) | set(reals)
    vend_ids = {v for v, _ in chaves}
    prod_ids = {p for _, p in chaves}
    vend_nomes = {v: n for v, n in db.execute(
        select(Vendedor.id, Vendedor.nome).where(Vendedor.id.in_(vend_ids or {-1}))).all()}
    prod_nomes = {p: n for p, n in db.execute(
        select(Produto.id, Produto.nome).where(Produto.id.in_(prod_ids or {-1}))).all()}

    linhas = []
    meta_total = Decimal(0)
    real_total = Decimal(0)
    for (v, p) in sorted(chaves, key=lambda k: (vend_nomes.get(k[0], ""), prod_nomes.get(k[1], ""))):
        mv = metas.get((v, p), Decimal(0))
        rv = reals.get((v, p), Decimal(0))
        meta_total += mv
        real_total += rv
        linhas.append(LinhaAtingimento(
            vendedor_id=v, vendedor_nome=vend_nomes.get(v),
            produto_id=p, produto_nome=prod_nomes.get(p),
            meta=mv, realizado=rv, percentual=_pct(mv, rv)))

    return DashboardResposta(
        ano=ano, periodo_tipo=periodo_tipo, periodo_ref=periodo_ref, meses=meses,
        meta_total=meta_total, realizado_total=real_total,
        percentual_total=_pct(meta_total, real_total), linhas=linhas)

@router.get("/dashboard/breakdown-produtos", response_model=BreakdownProdutosResposta)
def breakdown_produtos(
    ano: int, periodo_tipo: str = Query("mensal"), periodo_ref: int = Query(...),
    empresa_id: int | None = None, unidade_id: int | None = None,
    gerente_id: int | None = None, vendedor_id: int | None = None,
    produto_id: int | None = None,
    u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)
):
    meses = _meses_do_periodo(periodo_tipo, periodo_ref)
    vis = vendedores_visiveis(db, u)

    if vis is not None and not vis:
        return BreakdownProdutosResposta(produtos=[])

    def _filtros(stmt, model):
        if empresa_id is not None:
            stmt = stmt.where(model.empresa_id == empresa_id)
        if unidade_id is not None:
            stmt = stmt.where(model.unidade_id == unidade_id)
        if gerente_id is not None:
            stmt = stmt.where(model.gerente_id == gerente_id)
        if produto_id is not None:
            stmt = stmt.where(model.produto_id == produto_id)
        if vendedor_id is not None:
            stmt = stmt.where(model.vendedor_id == vendedor_id)
        if vis is not None:
            stmt = stmt.where(model.vendedor_id.in_(vis))
        return stmt

    meta_stmt = (
        select(Meta.produto_id, func.sum(Meta.valor))
        .join(Periodo, Meta.periodo_id == Periodo.id)
        .where(Meta.ativo.is_(True), Periodo.ano == ano, Periodo.mes.in_(meses))
        .group_by(Meta.produto_id)
    )
    meta_stmt = _filtros(meta_stmt, Meta)
    metas = {p: (v or Decimal(0)) for p, v in db.execute(meta_stmt).all()}

    real_stmt = (
        select(Realizado.produto_id, func.sum(Realizado.valor))
        .where(Realizado.ativo.is_(True),
               extract("year", Realizado.data_venda) == ano,
               extract("month", Realizado.data_venda).in_(meses))
        .group_by(Realizado.produto_id)
    )
    real_stmt = _filtros(real_stmt, Realizado)
    reals = {p: (v or Decimal(0)) for p, v in db.execute(real_stmt).all()}

    prod_ids = set(metas) | set(reals)
    prod_nomes = {p: n for p, n in db.execute(
        select(Produto.id, Produto.nome).where(Produto.id.in_(prod_ids or {-1}))).all()}

    linhas = []
    for pid in sorted(prod_ids, key=lambda p: prod_nomes.get(p, "")):
        m = metas.get(pid, Decimal(0))
        r = reals.get(pid, Decimal(0))
        linhas.append(LinhaProdutoBreakdown(
            produto_id=pid,
            produto_nome=prod_nomes.get(pid, str(pid)),
            meta_total=m,
            realizado_total=r,
            percentual=_pct(m, r),
        ))

    return BreakdownProdutosResposta(produtos=linhas)
