from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.produto import Produto
from app.models.usuario import Usuario
from app.schemas.produto import ProdutoCreate, ProdutoRead

router = APIRouter(prefix="/produtos", tags=["produtos"])


@router.post("", response_model=ProdutoRead, status_code=status.HTTP_201_CREATED)
def criar_produto(
    payload: ProdutoCreate, db: Session = Depends(get_db), _: Usuario = Depends(require_admin)
) -> Produto:
    produto = Produto(empresa_id=payload.empresa_id, nome=payload.nome)
    db.add(produto)
    db.commit()
    db.refresh(produto)
    return produto


@router.get("", response_model=list[ProdutoRead])
def listar_produtos(
    empresa_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
) -> list[Produto]:
    return db.query(Produto).filter(Produto.empresa_id == empresa_id, Produto.ativo.is_(True)).all()


@router.get("/{produto_id}", response_model=ProdutoRead)
def obter_produto(
    produto_id: uuid.UUID, db: Session = Depends(get_db), _: Usuario = Depends(get_current_user)
) -> Produto:
    produto = db.get(Produto, produto_id)
    if produto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")
    return produto
