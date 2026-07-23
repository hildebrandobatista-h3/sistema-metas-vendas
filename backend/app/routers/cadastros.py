"""Endpoints de cadastro estrutural (protegidos).

Leitura (GET): filtrada por hierarquia do perfil logado.
  - admin    : ve tudo
  - gerente  : ve apenas sua unidade, seus vendedores, sua empresa
  - vendedor : ve apenas ele mesmo, seu gerente, sua unidade, sua empresa
Escrita (POST/PATCH/DELETE): apenas admin.
PATCH edita o nome (e, no vendedor, a referencia externa).
DELETE sempre inativa (soft delete), nunca apaga de fato.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import usuario_atual, so_admin
from ..models import Empresa, Unidade, Gerente, Vendedor, Produto, Usuario
from ..schemas.cadastros import (
    EmpresaCreate, EmpresaOut, EmpresaUpdate,
    UnidadeCreate, UnidadeOut, UnidadeUpdate,
    GerenteCreate, GerenteOut, GerenteUpdate,
    VendedorCreate, VendedorOut, VendedorUpdate,
    ProdutoCreate, ProdutoOut, ProdutoUpdate,
)

router = APIRouter(tags=["cadastros"])


def _get_or_404(db, model, id_, nome):
    obj = db.get(model, id_)
    if obj is None:
        raise HTTPException(404, f"{nome} nao encontrado")
    return obj


def _commit_ou_conflito(db, obj, msg):
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, msg)
    db.refresh(obj)
    return obj


def _scope(db: Session, u: Usuario) -> dict:
    """Resolve IDs de empresa/unidade/gerente/vendedor para o usuario logado.

    Retorna dict vazio para admin (sem restricao).
    Para gerente: gerente_id, unidade_id, empresa_id.
    Para vendedor: vendedor_id, gerente_id, unidade_id, empresa_id.
    """
    if u.perfil == "admin":
        return {}
    if u.perfil == "gerente":
        g = db.get(Gerente, u.gerente_id)
        if not g:
            return {}
        un = db.get(Unidade, g.unidade_id)
        return {
            "gerente_id": g.id,
            "unidade_id": g.unidade_id,
            "empresa_id": un.empresa_id if un else None,
        }
    if u.perfil == "vendedor":
        v = db.get(Vendedor, u.vendedor_id)
        if not v:
            return {}
        g = db.get(Gerente, v.gerente_id)
        if not g:
            return {}
        un = db.get(Unidade, g.unidade_id)
        return {
            "vendedor_id": v.id,
            "gerente_id": g.id,
            "unidade_id": g.unidade_id,
            "empresa_id": un.empresa_id if un else None,
        }
    return {}


# ── EMPRESAS ─────────────────────────────────────────────────────────────────

@router.get("/empresas", response_model=list[EmpresaOut])
def listar_empresas(incluir_inativos: bool = False,
                    u: Usuario = Depends(usuario_atual),
                    db: Session = Depends(get_db)):
    stmt = select(Empresa)
    sc = _scope(db, u)
    if "empresa_id" in sc:
        stmt = stmt.where(Empresa.id == sc["empresa_id"])
    if not incluir_inativos:
        stmt = stmt.where(Empresa.ativo.is_(True))
    return db.scalars(stmt.order_by(Empresa.nome)).all()


@router.post("/empresas", response_model=EmpresaOut, status_code=201)
def criar_empresa(payload: EmpresaCreate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = Empresa(nome=payload.nome); db.add(obj)
    return _commit_ou_conflito(db, obj, "ja existe empresa com esse nome")


@router.patch("/empresas/{id_}", response_model=EmpresaOut)
def editar_empresa(id_: int, payload: EmpresaUpdate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = _get_or_404(db, Empresa, id_, "empresa")
    obj.nome = payload.nome
    return _commit_ou_conflito(db, obj, "ja existe empresa com esse nome")


@router.delete("/empresas/{id_}", status_code=204)
def inativar_empresa(id_: int, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = _get_or_404(db, Empresa, id_, "empresa"); obj.ativo = False; db.commit()


# ── UNIDADES ──────────────────────────────────────────────────────────────────

@router.get("/unidades", response_model=list[UnidadeOut])
def listar_unidades(empresa_id: int | None = Query(None),
                    incluir_inativos: bool = False,
                    u: Usuario = Depends(usuario_atual),
                    db: Session = Depends(get_db)):
    stmt = select(Unidade)
    sc = _scope(db, u)
    if "unidade_id" in sc:
        # gerente e vendedor: so sua propria unidade
        stmt = stmt.where(Unidade.id == sc["unidade_id"])
    else:
        # admin: filtro opcional por empresa
        if empresa_id is not None:
            stmt = stmt.where(Unidade.empresa_id == empresa_id)
    if not incluir_inativos:
        stmt = stmt.where(Unidade.ativo.is_(True))
    return db.scalars(stmt.order_by(Unidade.nome)).all()


@router.post("/unidades", response_model=UnidadeOut, status_code=201)
def criar_unidade(payload: UnidadeCreate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    _get_or_404(db, Empresa, payload.empresa_id, "empresa")
    obj = Unidade(empresa_id=payload.empresa_id, nome=payload.nome); db.add(obj)
    return _commit_ou_conflito(db, obj, "ja existe unidade com esse nome nesta empresa")


@router.patch("/unidades/{id_}", response_model=UnidadeOut)
def editar_unidade(id_: int, payload: UnidadeUpdate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = _get_or_404(db, Unidade, id_, "unidade")
    obj.nome = payload.nome
    return _commit_ou_conflito(db, obj, "ja existe unidade com esse nome nesta empresa")


@router.delete("/unidades/{id_}", status_code=204)
def inativar_unidade(id_: int, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = _get_or_404(db, Unidade, id_, "unidade"); obj.ativo = False; db.commit()


# ── GERENTES ──────────────────────────────────────────────────────────────────

@router.get("/gerentes", response_model=list[GerenteOut])
def listar_gerentes(unidade_id: int | None = Query(None),
                    incluir_inativos: bool = False,
                    u: Usuario = Depends(usuario_atual),
                    db: Session = Depends(get_db)):
    stmt = select(Gerente)
    sc = _scope(db, u)
    if "gerente_id" in sc:
        # gerente ve apenas si mesmo; vendedor ve seu gerente
        stmt = stmt.where(Gerente.id == sc["gerente_id"])
    else:
        # admin: filtro opcional por unidade
        if unidade_id is not None:
            stmt = stmt.where(Gerente.unidade_id == unidade_id)
    if not incluir_inativos:
        stmt = stmt.where(Gerente.ativo.is_(True))
    return db.scalars(stmt.order_by(Gerente.nome)).all()


@router.post("/gerentes", response_model=GerenteOut, status_code=201)
def criar_gerente(payload: GerenteCreate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    _get_or_404(db, Unidade, payload.unidade_id, "unidade")
    obj = Gerente(unidade_id=payload.unidade_id, nome=payload.nome); db.add(obj)
    return _commit_ou_conflito(db, obj, "ja existe gerente com esse nome nesta unidade")


@router.patch("/gerentes/{id_}", response_model=GerenteOut)
def editar_gerente(id_: int, payload: GerenteUpdate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = _get_or_404(db, Gerente, id_, "gerente")
    obj.nome = payload.nome
    return _commit_ou_conflito(db, obj, "ja existe gerente com esse nome nesta unidade")


@router.delete("/gerentes/{id_}", status_code=204)
def inativar_gerente(id_: int, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = _get_or_404(db, Gerente, id_, "gerente"); obj.ativo = False; db.commit()


# ── VENDEDORES ────────────────────────────────────────────────────────────────

@router.get("/vendedores", response_model=list[VendedorOut])
def listar_vendedores(gerente_id: int | None = Query(None),
                      incluir_inativos: bool = False,
                      u: Usuario = Depends(usuario_atual),
                      db: Session = Depends(get_db)):
    stmt = select(Vendedor)
    sc = _scope(db, u)
    if u.perfil == "vendedor":
        stmt = stmt.where(Vendedor.id == sc.get("vendedor_id", -1))
    elif u.perfil == "gerente":
        stmt = stmt.where(Vendedor.gerente_id == sc.get("gerente_id", -1))
        # permite filtrar por gerente_id apenas se for o proprio gerente
        if gerente_id is not None and gerente_id != sc.get("gerente_id"):
            return []
    else:
        # admin: filtro opcional por gerente
        if gerente_id is not None:
            stmt = stmt.where(Vendedor.gerente_id == gerente_id)
    if not incluir_inativos:
        stmt = stmt.where(Vendedor.ativo.is_(True))
    return db.scalars(stmt.order_by(Vendedor.nome)).all()


@router.post("/vendedores", response_model=VendedorOut, status_code=201)
def criar_vendedor(payload: VendedorCreate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    _get_or_404(db, Gerente, payload.gerente_id, "gerente")
    obj = Vendedor(gerente_id=payload.gerente_id, nome=payload.nome, ref_externa=payload.ref_externa); db.add(obj)
    return _commit_ou_conflito(db, obj, "ja existe vendedor com esse nome neste gerente")


@router.patch("/vendedores/{id_}", response_model=VendedorOut)
def editar_vendedor(id_: int, payload: VendedorUpdate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = _get_or_404(db, Vendedor, id_, "vendedor")
    obj.nome = payload.nome
    obj.ref_externa = payload.ref_externa
    return _commit_ou_conflito(db, obj, "ja existe vendedor com esse nome neste gerente")


@router.delete("/vendedores/{id_}", status_code=204)
def inativar_vendedor(id_: int, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = _get_or_404(db, Vendedor, id_, "vendedor"); obj.ativo = False; db.commit()


# ── PRODUTOS (globais — sem restricao por perfil) ─────────────────────────────

@router.get("/produtos", response_model=list[ProdutoOut])
def listar_produtos(incluir_inativos: bool = False, _: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    stmt = select(Produto)
    if not incluir_inativos:
        stmt = stmt.where(Produto.ativo.is_(True))
    return db.scalars(stmt.order_by(Produto.id)).all()


@router.post("/produtos", response_model=ProdutoOut, status_code=201)
def criar_produto(payload: ProdutoCreate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = Produto(nome=payload.nome); db.add(obj)
    return _commit_ou_conflito(db, obj, "ja existe produto com esse nome")


@router.patch("/produtos/{id_}", response_model=ProdutoOut)
def editar_produto(id_: int, payload: ProdutoUpdate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = _get_or_404(db, Produto, id_, "produto")
    obj.nome = payload.nome
    return _commit_ou_conflito(db, obj, "ja existe produto com esse nome")


@router.delete("/produtos/{id_}", status_code=204)
def inativar_produto(id_: int, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    obj = _get_or_404(db, Produto, id_, "produto"); obj.ativo = False; db.commit()
