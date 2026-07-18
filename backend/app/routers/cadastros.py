from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import usuario_atual, so_admin
from ..models import Empresa, Unidade, Gerente, Vendedor, Produto, Usuario
from ..schemas.cadastros import (
    EmpresaCreate, EmpresaOut, UnidadeCreate, UnidadeOut,
    GerenteCreate, GerenteOut, VendedorCreate, VendedorOut,
    ProdutoCreate, ProdutoOut,
)

router = APIRouter(tags=["cadastros"])


def _get_or_404(db: Session, model, id_: int, nome: str):
    obj = db.get(model, id_)
    if obj is None:
        raise HTTPException(404, f"{nome} nao encontrado")
    return obj


@router.get("/empresas", response_model=list[EmpresaOut])
def listar_empresas(incluir_inativos: bool = False, _: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    stmt = select(Empresa)
    if not incluir_inativos:
        stmt = stmt.where(Empresa.ativo.is_(True))
    return db.scalars(stmt.order_by(Empresa.nome)).all()


@router.post("/empresas", response_model=EmpresaOut, status_code=201)
def criar_empresa(payload: EmpresaCreate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = Empresa(nome=payload.nome)
    db.add(obj)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "ja existe empresa com esse nome")
    db.refresh(obj)
    return obj


@router.delete("/empresas/{id_}", status_code=204)
def inativar_empresa(id_: int, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = _get_or_404(db, Empresa, id_, "empresa")
    obj.ativo = False
    db.commit()


@router.get("/unidades", response_model=list[UnidadeOut])
def listar_unidades(empresa_id: int | None = Query(None), incluir_inativos: bool = False,
                     _: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    stmt = select(Unidade)
    if empresa_id is not None:
        stmt = stmt.where(Unidade.empresa_id == empresa_id)
    if not incluir_inativos:
        stmt = stmt.where(Unidade.ativo.is_(True))
    return db.scalars(stmt.order_by(Unidade.nome)).all()


@router.post("/unidades", response_model=UnidadeOut, status_code=201)
def criar_unidade(payload: UnidadeCreate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    _get_or_404(db, Empresa, payload.empresa_id, "empresa")
    obj = Unidade(empresa_id=payload.empresa_id, nome=payload.nome)
    db.add(obj)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "ja existe unidade com esse nome nesta empresa")
    db.refresh(obj)
    return obj


@router.delete("/unidades/{id_}", status_code=204)
def inativar_unidade(id_: int, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = _get_or_404(db, Unidade, id_, "unidade")
    obj.ativo = False
    db.commit()


@router.get("/gerentes", response_model=list[GerenteOut])
def listar_gerentes(unidade_id: int | None = Query(None), incluir_inativos: bool = False,
                    _: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    stmt = select(Gerente)
    if unidade_id is not None:
        stmt = stmt.where(Gerente.unidade_id == unidade_id)
    if not incluir_inativos:
        stmt = stmt.where(Gerente.ativo.is_(True))
    return db.scalars(stmt.order_by(Gerente.nome)).all()


@router.post("/gerentes", response_model=GerenteOut, status_code=201)
def criar_gerente(payload: GerenteCreate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    _get_or_404(db, Unidade, payload.unidade_id, "unidade")
    obj = Gerente(unidade_id=payload.unidade_id, nome=payload.nome)
    db.add(obj)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "ja existe gerente com esse nome nesta unidade")
    db.refresh(obj)
    return obj


@router.delete("/gerentes/{id_}", status_code=204)
def inativar_gerente(id_: int, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = _get_or_404(db, Gerente, id_, "gerente")
    obj.ativo = False
    db.commit()


@router.get("/vendedores", response_model=list[VendedorOut])
def listar_vendedores(gerente_id: int | None = Query(None), incluir_inativos: bool = False,
                      _: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    stmt = select(Vendedor)
    if gerente_id is not None:
        stmt = stmt.where(Vendedor.gerente_id == gerente_id)
    if not incluir_inativos:
        stmt = stmt.where(Vendedor.ativo.is_(True))
    return db.scalars(stmt.order_by(Vendedor.nome)).all()


@router.post("/vendedores", response_model=VendedorOut, status_code=201)
def criar_vendedor(payload: VendedorCreate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    _get_or_404(db, Gerente, payload.gerente_id, "gerente")
    obj = Vendedor(gerente_id=payload.gerente_id, nome=payload.nome, ref_externa=payload.ref_externa)
    db.add(obj)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "ja existe vendedor com esse nome neste gerente")
    db.refresh(obj)
    return obj


@router.delete("/vendedores/{id_}", status_code=204)
def inativar_vendedor(id_: int, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = _get_or_404(db, Vendedor, id_, "vendedor")
    obj.ativo = False
    db.commit()


@router.get("/produtos", response_model=list[ProdutoOut])
def listar_produtos(incluir_inativos: bool = False, _: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    stmt = select(Produto)
    if not incluir_inativos:
        stmt = stmt.where(Produto.ativo.is_(True))
    return db.scalars(stmt.order_by(Produto.id)).all()


@router.post("/produtos", response_model=ProdutoOut, status_code=201)
def criar_produto(payload: ProdutoCreate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = Produto(nome=payload.nome)
    db.add(obj)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "ja existe produto com esse nome")
    db.refresh(obj)
    return obj


@router.delete("/produtos/{id_}", status_code=204)
def inativar_produto(id_: int, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = _get_or_404(db, Produto, id_, "produto")
    obj.ativo = False
    db.commit()
