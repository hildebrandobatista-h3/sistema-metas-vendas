from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.enums import StatusMeta, TipoMedida


class MetaCreate(BaseModel):
    competencia_id: uuid.UUID
    estrutura_no_id: uuid.UUID
    produto_id: uuid.UUID
    tipo_medida: TipoMedida
    valor_meta: Decimal


class MetaUpdate(BaseModel):
    valor_meta: Decimal
    motivo: Optional[str] = None


class MetaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    competencia_id: uuid.UUID
    estrutura_no_id: uuid.UUID
    produto_id: uuid.UUID
    tipo_medida: TipoMedida
    valor_meta: Decimal
    status: StatusMeta


class MetaHistoricoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    meta_id: uuid.UUID
    valor_anterior: Optional[Decimal]
    valor_novo: Decimal
    usuario_id: uuid.UUID
    alterado_em: datetime
    motivo: Optional[str]


class PublicarMetaResponse(BaseModel):
    publicada: bool
    gap: Optional[Decimal] = None
    soma_filhos: Optional[Decimal] = None
