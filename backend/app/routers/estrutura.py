from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.core.security import hash_password
from app.models.empresa import Empresa
from app.models.enums import PapelUsuario, TipoNo
from app.models.estrutura_no import EstruturaNo
from app.models.unidade_negocio import UnidadeNegocio
from app.models.usuario import Usuario
from app.schemas.estrutura import (
    EmpresaCreate,
    EmpresaRead,
    EstruturaNoRead,
    UnidadeCreate,
    UnidadeRead,
    UsuarioCreate,
    UsuarioRead,
)

router = APIRouter(prefix="/estrutura", tags=["estrutura"])


def _no_por_ref(db: Session, tipo: TipoNo, ref_id: uuid.UUID) -> EstruturaNo:
    no = db.query(EstruturaNo).filter(EstruturaNo.tipo == tipo, EstruturaNo.ref_id == ref_id).first()
    if no is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Nó de estrutura não encontrado para {tipo.value}={ref_id}",
        )
    return no


@router.post("/empresas", response_model=EmpresaRead, status_code=status.HTTP_201_CREATED)
def criar_empresa(
    payload: EmpresaCreate, db: Session = Depends(get_db), _: Usuario = Depends(require_admin)
) -> Empresa:
    if db.query(Empresa).filter(Empresa.cnpj == payload.cnpj).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="CNPJ já cadastrado")

    empresa = Empresa(razao_social=payload.razao_social, cnpj=payload.cnpj)
    db.add(empresa)
    db.flush()
    db.add(EstruturaNo(empresa_id=empresa.id, tipo=TipoNo.EMPRESA, no_pai_id=None, ref_id=empresa.id))
    db.commit()
    db.refresh(empresa)
    return empresa


@router.get("/empresas", response_model=list[EmpresaRead])
def listar_empresas(
    db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)
) -> list[Empresa]:
    query = db.query(Empresa).filter(Empresa.ativo.is_(True))
    if usuario.papel != PapelUsuario.ADMIN:
        query = query.filter(Empresa.id == usuario.empresa_id)
    return query.all()


@router.get("/empresas/{empresa_id}", response_model=EmpresaRead)
def obter_empresa(empresa_id: uuid.UUID, db: Session = Depends(get_db)) -> Empresa:
    empresa = db.get(Empresa, empresa_id)
    if empresa is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa não encontrada")
    return empresa


@router.post("/unidades", response_model=UnidadeRead, status_code=status.HTTP_201_CREATED)
def criar_unidade(
    payload: UnidadeCreate, db: Session = Depends(get_db), _: Usuario = Depends(require_admin)
) -> UnidadeNegocio:
    empresa = db.get(Empresa, payload.empresa_id)
    if empresa is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa não encontrada")
    no_empresa = _no_por_ref(db, TipoNo.EMPRESA, empresa.id)

    unidade = UnidadeNegocio(empresa_id=empresa.id, nome=payload.nome)
    db.add(unidade)
    db.flush()
    db.add(
        EstruturaNo(empresa_id=empresa.id, tipo=TipoNo.UNIDADE, no_pai_id=no_empresa.id, ref_id=unidade.id)
    )
    db.commit()
    db.refresh(unidade)
    return unidade


@router.post("/usuarios", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
def criar_usuario(
    payload: UsuarioCreate, db: Session = Depends(get_db), _: Usuario = Depends(require_admin)
) -> Usuario:
    if db.query(Usuario).filter(Usuario.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado")

    no_pai = None
    empresa_id = None

    if payload.papel == PapelUsuario.DIRETOR:
        if payload.unidade_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="unidade_id é obrigatório para papel DIRETOR"
            )
        no_pai = _no_por_ref(db, TipoNo.UNIDADE, payload.unidade_id)
        empresa_id = no_pai.empresa_id
    elif payload.papel == PapelUsuario.GERENTE:
        if payload.superior_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="superior_id (de um DIRETOR) é obrigatório para papel GERENTE",
            )
        no_pai = _no_por_ref(db, TipoNo.DIRETOR, payload.superior_id)
        empresa_id = no_pai.empresa_id
    elif payload.papel == PapelUsuario.VENDEDOR:
        if payload.superior_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="superior_id (de um GERENTE) é obrigatório para papel VENDEDOR",
            )
        no_pai = _no_por_ref(db, TipoNo.GERENTE, payload.superior_id)
        empresa_id = no_pai.empresa_id
    # ADMIN: global, sem nó de estrutura e sem empresa_id.

    usuario = Usuario(
        empresa_id=empresa_id,
        nome=payload.nome,
        email=payload.email,
        hashed_password=hash_password(payload.senha),
        papel=payload.papel,
        unidade_id=payload.unidade_id if payload.papel == PapelUsuario.DIRETOR else None,
        superior_id=payload.superior_id
        if payload.papel in (PapelUsuario.GERENTE, PapelUsuario.VENDEDOR)
        else None,
    )
    db.add(usuario)
    db.flush()

    if no_pai is not None:
        tipo_no = TipoNo(payload.papel.value)
        db.add(EstruturaNo(empresa_id=empresa_id, tipo=tipo_no, no_pai_id=no_pai.id, ref_id=usuario.id))

    db.commit()
    db.refresh(usuario)
    return usuario


@router.get("/arvore/{empresa_id}", response_model=list[EstruturaNoRead])
def obter_arvore(empresa_id: uuid.UUID, db: Session = Depends(get_db)) -> list[EstruturaNoRead]:
    nos = db.query(EstruturaNo).filter(EstruturaNo.empresa_id == empresa_id).all()

    ids_unidade = [n.ref_id for n in nos if n.tipo == TipoNo.UNIDADE]
    ids_usuario = [n.ref_id for n in nos if n.tipo in (TipoNo.DIRETOR, TipoNo.GERENTE, TipoNo.VENDEDOR)]

    nomes_unidade = {
        u.id: u.nome for u in db.query(UnidadeNegocio).filter(UnidadeNegocio.id.in_(ids_unidade)).all()
    }
    nomes_usuario = {u.id: u.nome for u in db.query(Usuario).filter(Usuario.id.in_(ids_usuario)).all()}
    empresa = db.get(Empresa, empresa_id)

    resultado = []
    for no in nos:
        if no.tipo == TipoNo.EMPRESA:
            nome = empresa.razao_social if empresa else "?"
        elif no.tipo == TipoNo.UNIDADE:
            nome = nomes_unidade.get(no.ref_id, "?")
        else:
            nome = nomes_usuario.get(no.ref_id, "?")
        resultado.append(
            EstruturaNoRead(
                id=no.id,
                empresa_id=no.empresa_id,
                tipo=no.tipo,
                no_pai_id=no.no_pai_id,
                ref_id=no.ref_id,
                nome=nome,
            )
        )
    return resultado
