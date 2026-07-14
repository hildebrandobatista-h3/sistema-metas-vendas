from __future__ import annotations

import uuid

from sqlalchemy import Boolean, Column, Enum, ForeignKey, String, Uuid

from app.core.database import Base
from app.models.enums import PapelUsuario


class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    # Admin é global e não pertence a uma empresa específica — por isso nullable.
    empresa_id = Column(Uuid, ForeignKey("empresa.id"), nullable=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(200), nullable=False, unique=True)
    hashed_password = Column(String(200), nullable=False)
    papel = Column(Enum(PapelUsuario, name="papel_usuario"), nullable=False)
    unidade_id = Column(Uuid, ForeignKey("unidade_negocio.id"), nullable=True)
    superior_id = Column(Uuid, ForeignKey("usuario.id"), nullable=True)
    ativo = Column(Boolean, nullable=False, default=True)
