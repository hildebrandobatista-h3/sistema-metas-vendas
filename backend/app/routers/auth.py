from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import create_access_token, verify_password
from app.models.usuario import Usuario
from app.schemas.auth import MeResponse, Token
from app.services.arvore import get_no_do_usuario

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Token:
    usuario = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    if usuario is None or not usuario.ativo or not verify_password(form_data.password, usuario.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha inválidos")
    token = create_access_token(subject=str(usuario.id), papel=usuario.papel.value)
    return Token(access_token=token)


@router.get("/me", response_model=MeResponse)
def me(db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)) -> MeResponse:
    no = get_no_do_usuario(db, usuario)
    return MeResponse(
        id=usuario.id,
        nome=usuario.nome,
        email=usuario.email,
        papel=usuario.papel,
        empresa_id=usuario.empresa_id,
        estrutura_no_id=no.id if no is not None else None,
    )
