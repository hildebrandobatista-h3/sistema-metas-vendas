from __future__ import annotations

import uuid
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class IndicadorNoRead(BaseModel):
    estrutura_no_id: uuid.UUID
    meta: Decimal
    realizado: Decimal
    percentual: Optional[Decimal] = None


class PontoEvolucaoRead(BaseModel):
    ano: int
    mes: int
    meta_acumulada: Decimal
    realizado_acumulado: Decimal
    percentual: Optional[Decimal] = None


class JanelaIndicadorRead(BaseModel):
    meta: Decimal
    realizado: Decimal
    percentual: Optional[Decimal] = None
    tem_dado: bool


class ComparacaoYoYRead(BaseModel):
    atual: JanelaIndicadorRead
    anterior: JanelaIndicadorRead
