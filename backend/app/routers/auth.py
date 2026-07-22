from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Usuario, Gerente, Vendedor
from ..schemas.auth import LoginResposta, UsuarioCreate, UsuarioOut, SenhaUpdate, UsuarioUpdate
from ..security import conferir_senha, criar_token, hash_senha
from ..deps import so_admin, usuario_atual

router = APIRouter(tags=["auth"])


@router.post("/login", response_model=LoginResposta)
def login(dados: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    u = db.scalar(select(Usuario).where(Usuario.login == dados.username))
    if u is None or not u.ativo or not conferir_senha(dados.password, u.senha_hash):
        raise HTTPException(401, "login ou senha invalidos")
    return LoginResposta(access_token=criar_token(u.id, u.perfil), perfil=u.perfil, nome=u.nome)


@router.get("/eu", response_model=UsuarioOut)
def eu(u: Usuario = Depends(usuario_atual)):
    return u


def _valida_vinculo(db, perfil, gerente_id, vendedor_id):
    if perfil == "admin":
        if gerente_id or vendedor_id:
            raise HTTPException(422, "admin nao deve ter vinculo de gerente ou vendedor")
    elif perfil == "gerente":
        if not gerente_id or vendedor_id:
            raise HTTPException(422, "gerente exige gerente_id e nao pode ter vendedor_id")
        if db.get(Gerente, gerente_id) is None:
            raise HTTPException(404, "gerente_id nao encontrado")
    elif perfil == "vendedor":
        if not vendedor_id or gerente_id:
            raise HTTPException(422, "vendedor exige vendedor_id e nao pode ter gerente_id")
        if db.get(Vendedor, vendedor_id) is None:
            raise HTTPException(404, "vendedor_id nao encontrado")


@router.post("/usuarios", response_model=UsuarioOut, status_code=201)
def criar_usuario(payload: UsuarioCreate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    _valida_vinculo(db, payload.perfil, payload.gerente_id, payload.vendedor_id)
    u = Usuario(login=payload.login, senha_hash=hash_senha(payload.senha), perfil=payload.perfil,
                nome=payload.nome, gerente_id=payload.gerente_id, vendedor_id=payload.vendedor_id)
    db.add(u)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "ja existe usuario com esse login")
    db.refresh(u)
    return u


@router.get("/usuarios", response_model=list[UsuarioOut])
def listar_usuarios(incluir_inativos: bool = False, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    stmt = select(Usuario)
    if not incluir_inativos:
        stmt = stmt.where(Usuario.ativo.is_(True))
    return db.scalars(stmt.order_by(Usuario.login)).all()


@router.patch("/usuarios/{id_}/senha", status_code=204)
def redefinir_senha(id_: int, payload: SenhaUpdate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    u = db.get(Usuario, id_)
    if u is None:
        raise HTTPException(404, "usuario nao encontrado")
    u.senha_hash = hash_senha(payload.senha)
    db.commit()


@router.delete("/usuarios/{id_}", status_code=204)
def inativar_usuario(id_: int, admin: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    if id_ == admin.id:
        raise HTTPException(422, "voce nao pode inativar o proprio usuario")
    u = db.get(Usuario, id_)
    if u is None:
        raise HTTPException(404, "usuario nao encontrado")
    u.ativo = False
    db.commit()


@router.patch('/usuarios/{id_}', response_model=UsuarioOut)
def editar_usuario(id_: int, payload: UsuarioUpdate, admin: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    u = db.get(Usuario, id_)
    if u is None:
        raise HTTPException(404, 'usuario nao encontrado')
    _valida_vinculo(db, payload.perfil, payload.gerente_id, payload.vendedor_id)
    # checar login duplicado
    from sqlalchemy import select as _sel
    existente = db.scalar(_sel(Usuario).where(Usuario.login == payload.login, Usuario.id != id_))
    if existente:
        raise HTTPException(409, 'ja existe usuario com esse login')
    u.login = payload.login
    u.nome = payload.nome
    u.perfil = payload.perfil
    u.gerente_id = payload.gerente_id
    u.vendedor_id = payload.vendedor_id
    if payload.senha and payload.senha.strip():
        from ..security import hash_senha
        u.senha_hash = hash_senha(payload.senha)
    db.commit()
    db.refresh(u)
    return u
