from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.enums import AcaoFechamento, StatusCompetencia, TipoMedida


class CompetenciaCreate(BaseModel):
    empresa_id: uuid.UUID
    ano: int
    mes: int


class CompetenciaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    empresa_id: uuid.UUID
    ano: int
    mes: int
    status: StatusCompetencia
    fechada_em: Optional[datetime]
    reaberta_em: Optional[datetime]


class ViolacaoPisoRead(BaseModel):
    estrutura_no_id: uuid.UUID
    produto_id: uuid.UUID
    tipo_medida: TipoMedida
    meta_pai: Decimal
    soma_filhos: Decimal
    gap: Decimal


class PublicarCompetenciaResponse(BaseModel):
    publicada: bool
    violacoes: list[ViolacaoPisoRead]


class ReabrirCompetenciaRequest(BaseModel):
    motivo: str


class FechamentoEventoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    competencia_id: uuid.UUID
    acao: AcaoFechamento
    usuario_id: uuid.UUID
    executado_em: datetime
    observacao: Optional[str]
