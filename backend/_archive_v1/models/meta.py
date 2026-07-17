from __future__ import annotations

import uuid

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Numeric, String, UniqueConstraint, Uuid
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import StatusMeta, TipoMedida


class Meta(Base):
    __tablename__ = "meta"
    __table_args__ = (
        UniqueConstraint(
            "competencia_id", "estrutura_no_id", "produto_id", name="uq_meta_competencia_no_produto"
        ),
    )

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    competencia_id = Column(Uuid, ForeignKey("competencia.id"), nullable=False)
    estrutura_no_id = Column(Uuid, ForeignKey("estrutura_no.id"), nullable=False)
    produto_id = Column(Uuid, ForeignKey("produto.id"), nullable=False)
    tipo_medida = Column(Enum(TipoMedida, name="tipo_medida"), nullable=False)
    valor_meta = Column(Numeric(14, 2), nullable=False)
    status = Column(Enum(StatusMeta, name="status_meta"), nullable=False, default=StatusMeta.RASCUNHO)


class MetaHistorico(Base):
    __tablename__ = "meta_historico"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    meta_id = Column(Uuid, ForeignKey("meta.id"), nullable=False)
    valor_anterior = Column(Numeric(14, 2), nullable=True)
    valor_novo = Column(Numeric(14, 2), nullable=False)
    usuario_id = Column(Uuid, ForeignKey("usuario.id"), nullable=False)
    alterado_em = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    motivo = Column(String(500), nullable=True)
