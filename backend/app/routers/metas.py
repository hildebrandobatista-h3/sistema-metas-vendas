"""Endpoints de meta (protegidos).
Escrita: apenas admin. Leitura: admin tudo; gerente seus vendedores; vendedor o seu.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import usuario_atual, so_admin, vendedores_visiveis
from ..models import Meta, Produto, Periodo, Usuario
from ..schemas.metas import MetaLoteCreate, MetaUpdate, MetaOut
from ._helpers import resolver_hierarquia, get_or_create_periodo

router = APIRouter(tags=["metas"])


@router.post("/metas/lote", response_model=list[MetaOut], status_code=201)
def cadastrar_metas_lote(payload: MetaLoteCreate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    hier = resolver_hierarquia(db, payload.vendedor_id)
    per = get_or_create_periodo(db, payload.ano, payload.mes)
    for item in payload.itens:
        prod = db.get(Produto, item.produto_id)
        if prod is None or not prod.ativo:
            raise HTTPException(404, f"produto {item.produto_id} nao encontrado ou inativo")
    resultado = []
    for item in payload.itens:
        existente = db.scalar(select(Meta).where(
            Meta.vendedor_id == payload.vendedor_id,
            Meta.produto_id == item.produto_id,
            Meta.periodo_id == per.id))
        if existente is not None:
            existente.valor = item.valor
            existente.ativo = True
            resultado.append(existente)
        else:
            m = Meta(vendedor_id=payload.vendedor_id, produto_id=item.produto_id,
                     periodo_id=per.id, valor=item.valor,
                     **{k: hier[k] for k in ("empresa_id", "unidade_id", "gerente_id")})
            db.add(m)
            resultado.append(m)
    db.commit()
    for m in resultado:
        db.refresh(m)
    return resultado


@router.get("/metas", response_model=list[MetaOut])
def listar_metas(vendedor_id: int | None = None, ano: int | None = None, mes: int | None = None,
                 incluir_inativos: bool = False, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    stmt = select(Meta)
    vis = vendedores_visiveis(db, u)
    if vis is not None:
        if not vis:
            return []
        stmt = stmt.where(Meta.vendedor_id.in_(vis))
    if vendedor_id is not None:
        stmt = stmt.where(Meta.vendedor_id == vendedor_id)
    if ano is not None or mes is not None:
        stmt = stmt.join(Periodo, Meta.periodo_id == Periodo.id)
        if ano is not None:
            stmt = stmt.where(Periodo.ano == ano)
        if mes is not None:
            stmt = stmt.where(Periodo.mes == mes)
    if not incluir_inativos:
        stmt = stmt.where(Meta.ativo.is_(True))
    return db.scalars(stmt).all()


@router.patch("/metas/{id_}", response_model=MetaOut)
def atualizar_meta(id_: int, payload: MetaUpdate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    m = db.get(Meta, id_)
    if m is None:
        raise HTTPException(404, "meta nao encontrada")
    m.valor = payload.valor
    db.commit()
    db.refresh(m)
    return m


@router.delete("/metas/{id_}", status_code=204)
def inativar_meta(id_: int, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    m = db.get(Meta, id_)
    if m is None:
        raise HTTPException(404, "meta nao encontrada")
    m.ativo = False
    db.commit()
