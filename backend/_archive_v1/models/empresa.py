from __future__ import annotations

import uuid

from sqlalchemy import Boolean, Column, DateTime, String, Uuid
from sqlalchemy.sql import func

from app.core.database import Base


class Empresa(Base):
    __tablename__ = "empresa"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    razao_social = Column(String(200), nullable=False)
    cnpj = Column(String(18), nullable=False, unique=True)
    ativo = Column(Boolean, nullable=False, default=True)
    criado_em = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
