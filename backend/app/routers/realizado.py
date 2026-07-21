"""Endpoints de realizado (protegidos).
Lancar/remover: admin qualquer; gerente seus vendedores; vendedor so o seu.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, extract
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import usuario_atual, vendedores_visiveis, pode_lancar_para
from ..models import Realizado, Produto, Usuario
from ..schemas.movimento import RealizadoCreate, RealizadoOut
from ._helpers import resolver_hierarquia

router = APIRouter(tags=["realizado"])


@router.post("/realizado", response_model=RealizadoOut, status_code=201)
def lancar_realizado(payload: RealizadoCreate, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    if not pode_lancar_para(db, u, payload.vendedor_id):
        raise HTTPException(403, "voce nao pode lancar realizado para este vendedor")
    hier = resolver_hierarquia(db, payload.vendedor_id)
    prod = db.get(Produto, payload.produto_id)
    if prod is None or not prod.ativo:
        raise HTTPException(404, "produto nao encontrado ou inativo")
    r = Realizado(
        vendedor_id=payload.vendedor_id,
        produto_id=payload.produto_id,
        data_venda=payload.data_venda,
        valor=payload.valor,
        origem="manual",
        descricao=payload.descricao,
        cnpj=payload.cnpj,
        codigo_cliente=payload.codigo_cliente,
        razao_social=payload.razao_social,
        nome_fantasia=payload.nome_fantasia,
        numero_oportunidade=payload.numero_oportunidade,
        numero_proposta=payload.numero_proposta,
        **{k: hier[k] for k in ("empresa_id", "unidade_id", "gerente_id")}
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@router.get("/realizado", response_model=list[RealizadoOut])
def listar_realizado(vendedor_id: int | None = None, ano: int | None = None, mes: int | None = None,
                     incluir_inativos: bool = False, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    stmt = select(Realizado)
    vis = vendedores_visiveis(db, u)
    if vis is not None:
        if not vis:
            return []
        stmt = stmt.where(Realizado.vendedor_id.in_(vis))
    if vendedor_id is not None:
        stmt = stmt.where(Realizado.vendedor_id == vendedor_id)
    if ano is not None:
        stmt = stmt.where(extract("year", Realizado.data_venda) == ano)
    if mes is not None:
        stmt = stmt.where(extract("month", Realizado.data_venda) == mes)
    if not incluir_inativos:
        stmt = stmt.where(Realizado.ativo.is_(True))
    return db.scalars(stmt.order_by(Realizado.data_venda)).all()


@router.patch("/realizado/{id_}", response_model=RealizadoOut)
def atualizar_realizado(id_: int, payload: RealizadoCreate, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    r = db.get(Realizado, id_)
    if r is None:
        raise HTTPException(404, "lancamento nao encontrado")
    if not pode_lancar_para(db, u, r.vendedor_id):
        raise HTTPException(403, "voce nao pode atualizar este lancamento")
    
    prod = db.get(Produto, payload.produto_id)
    if prod is None or not prod.ativo:
        raise HTTPException(404, "produto nao encontrado ou inativo")
    
    hier = resolver_hierarquia(db, payload.vendedor_id)
    
    r.vendedor_id = payload.vendedor_id
    r.produto_id = payload.produto_id
    r.data_venda = payload.data_venda
    r.valor = payload.valor
    r.descricao = payload.descricao
    r.cnpj = payload.cnpj
    r.codigo_cliente = payload.codigo_cliente
    r.razao_social = payload.razao_social
    r.nome_fantasia = payload.nome_fantasia
    r.numero_oportunidade = payload.numero_oportunidade
    r.numero_proposta = payload.numero_proposta
    r.empresa_id = hier["empresa_id"]
    r.unidade_id = hier["unidade_id"]
    r.gerente_id = hier["gerente_id"]
    
    db.commit()
    db.refresh(r)
    return r


@router.delete("/realizado/{id_}", status_code=204)
def inativar_realizado(id_: int, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    r = db.get(Realizado, id_)
    if r is None:
        raise HTTPException(404, "lancamento nao encontrado")
    if not pode_lancar_para(db, u, r.vendedor_id):
        raise HTTPException(403, "voce nao pode remover este lancamento")
    r.ativo = False
    db.commit()
