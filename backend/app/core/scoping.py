from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.enums import PapelUsuario
from app.models.usuario import Usuario
from app.services.arvore import escopo_no_ids


def verificar_escopo(db: Session, usuario: Usuario, estrutura_no_id: uuid.UUID) -> None:
    escopo = escopo_no_ids(db, usuario)
    if escopo is not None and estrutura_no_id not in escopo:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Fora do seu escopo de visão")


def verificar_empresa(usuario: Usuario, empresa_id: uuid.UUID) -> None:
    """Admin enxerga qualquer empresa; demais papéis só a própria."""
    if usuario.papel == PapelUsuario.ADMIN:
        return
    if usuario.empresa_id != empresa_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Fora da sua empresa")
