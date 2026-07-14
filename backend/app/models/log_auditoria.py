from __future__ import annotations

import uuid

from sqlalchemy import JSON, Column, DateTime, ForeignKey, String, Uuid
from sqlalchemy.sql import func

from app.core.database import Base


class LogAuditoria(Base):
    __tablename__ = "log_auditoria"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    entidade = Column(String(50), nullable=False)
    entidade_id = Column(Uuid, nullable=False)
    acao = Column(String(50), nullable=False)
    usuario_id = Column(Uuid, ForeignKey("usuario.id"), nullable=False)
    dados_antes = Column(JSON, nullable=True)
    dados_depois = Column(JSON, nullable=True)
    ocorrido_em = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
