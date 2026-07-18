from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .db import get_db
from .models import Usuario, Vendedor, Gerente
from .security import ler_token

oauth2 = OAuth2PasswordBearer(tokenUrl="/api/login")


def usuario_atual(token: str = Depends(oauth2), db: Session = Depends(get_db)) -> Usuario:
    dados = ler_token(token)
    if dados is None:
        raise HTTPException(401, "token invalido ou expirado", headers={"WWW-Authenticate": "Bearer"})
    u = db.get(Usuario, dados["usuario_id"])
    if u is None or not u.ativo:
        raise HTTPException(401, "usuario nao encontrado ou inativo")
    return u


def so_admin(u: Usuario = Depends(usuario_atual)) -> Usuario:
    if u.perfil != "admin":
        raise HTTPException(403, "apenas administradores podem fazer isso")
    return u


def vendedores_visiveis(db: Session, u: Usuario) -> set[int] | None:
    if u.perfil == "admin":
        return None
    if u.perfil == "gerente":
        if not u.gerente_id:
            return set()
        ids = db.query(Vendedor.id).filter(Vendedor.gerente_id == u.gerente_id).all()
        return {i[0] for i in ids}
    if u.perfil == "vendedor":
        return {u.vendedor_id} if u.vendedor_id else set()
    return set()


def pode_lancar_para(db: Session, u: Usuario, vendedor_id: int) -> bool:
    vis = vendedores_visiveis(db, u)
    if vis is None:
        return True
    return vendedor_id in vis
