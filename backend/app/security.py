import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-trocar-em-producao")
ALGORITHM = "HS256"
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_senha(senha: str) -> str:
    return _pwd.hash(senha)


def conferir_senha(senha: str, senha_hash: str) -> bool:
    return _pwd.verify(senha, senha_hash)


def criar_token(usuario_id: int, perfil: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MIN)
    return jwt.encode({"sub": str(usuario_id), "perfil": perfil, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)


def ler_token(token: str) -> dict | None:
    try:
        p = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"usuario_id": int(p["sub"]), "perfil": p["perfil"]}
    except (JWTError, KeyError, ValueError):
        return None
