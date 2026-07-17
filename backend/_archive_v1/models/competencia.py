from __future__ import annotations

import uuid

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, UniqueConstraint, Uuid

from app.core.database import Base
from app.models.enums import StatusCompetencia


class Competencia(Base):
    __tablename__ = "competencia"
    __table_args__ = (
        UniqueConstraint("empresa_id", "ano", "mes", name="uq_competencia_empresa_ano_mes"),
    )

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresa.id"), nullable=False)
    ano = Column(Integer, nullable=False)
    mes = Column(Integer, nullable=False)
    status = Column(
        Enum(StatusCompetencia, name="status_competencia"),
        nullable=False,
        default=StatusCompetencia.ABERTA,
    )
    fechada_em = Column(DateTime(timezone=True), nullable=True)
    reaberta_em = Column(DateTime(timezone=True), nullable=True)
