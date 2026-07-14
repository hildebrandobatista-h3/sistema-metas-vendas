from __future__ import annotations

import uuid

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Uuid
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import AcaoFechamento


class FechamentoEvento(Base):
    __tablename__ = "fechamento_evento"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    competencia_id = Column(Uuid, ForeignKey("competencia.id"), nullable=False)
    acao = Column(Enum(AcaoFechamento, name="acao_fechamento"), nullable=False)
    usuario_id = Column(Uuid, ForeignKey("usuario.id"), nullable=False)
    executado_em = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    observacao = Column(String(500), nullable=True)
