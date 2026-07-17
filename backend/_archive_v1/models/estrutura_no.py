from __future__ import annotations

import uuid

from sqlalchemy import Column, Enum, ForeignKey, Uuid

from app.core.database import Base
from app.models.enums import TipoNo


class EstruturaNo(Base):
    __tablename__ = "estrutura_no"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    empresa_id = Column(Uuid, ForeignKey("empresa.id"), nullable=False)
    tipo = Column(Enum(TipoNo, name="tipo_no"), nullable=False)
    no_pai_id = Column(Uuid, ForeignKey("estrutura_no.id"), nullable=True)
    # Polimórfico: aponta para empresa/unidade_negocio/usuario conforme `tipo`.
    # Não é FK de banco — validado em código (ver app/services/arvore.py).
    ref_id = Column(Uuid, nullable=False)
