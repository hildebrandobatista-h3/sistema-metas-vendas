from __future__ import annotations

import uuid

from sqlalchemy import Boolean, Column, ForeignKey, String, Uuid

from app.core.database import Base


class Produto(Base):
    __tablename__ = "produto"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresa.id"), nullable=False)
    nome = Column(String(150), nullable=False)
    ativo = Column(Boolean, nullable=False, default=True)
