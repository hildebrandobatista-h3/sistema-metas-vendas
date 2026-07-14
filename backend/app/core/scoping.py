from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.usuario import Usuario
from app.services.arvore import escopo_no_ids


def verificar_escopo(db: Session, usuario: Usuario, estrutura_no_id: uuid.UUID) -> None:
    escopo = escopo_no_ids(db, usuario)
    if escopo is not None and estrutura_no_id not in escopo:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Fora do seu escopo de visão")
