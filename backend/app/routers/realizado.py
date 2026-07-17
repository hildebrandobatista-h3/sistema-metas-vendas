from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, extract
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Realizado, Produto
from ..schemas.movimento import RealizadoCreate, RealizadoOut
from ._helpers import resolver_hierarquia

router = APIRouter(tags=["realizado"])


@router.post("/realizado", response_model=RealizadoOut, status_code=201)
def lancar_realizado(payload: RealizadoCreate, db: Session = Depends(get_db)):
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
        **{k: hier[k] for k in ("empresa_id", "unidade_id", "gerente_id")},
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@router.get("/realizado", response_model=list[RealizadoOut])
def listar_realizado(vendedor_id: int | None = None, ano: int | None = None, mes: int | None = None,
                     incluir_inativos: bool = False, db: Session = Depends(get_db)):
    stmt = select(Realizado)
    if vendedor_id is not None:
        stmt = stmt.where(Realizado.vendedor_id == vendedor_id)
    if ano is not None:
        stmt = stmt.where(extract("year", Realizado.data_venda) == ano)
    if mes is not None:
        stmt = stmt.where(extract("month", Realizado.data_venda) == mes)
    if not incluir_inativos:
        stmt = stmt.where(Realizado.ativo.is_(True))
    return db.scalars(stmt.order_by(Realizado.data_venda)).all()


@router.delete("/realizado/{id_}", status_code=204)
def inativar_realizado(id_: int, db: Session = Depends(get_db)):
    r = db.get(Realizado, id_)
    if r is None:
        raise HTTPException(404, "lancamento nao encontrado")
    r.ativo = False
    db.commit()
