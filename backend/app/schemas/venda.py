from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.enums import AcaoVendaHistorico, OrigemVenda, TipoMedida


class VendaCreate(BaseModel):
    competencia_id: uuid.UUID
    vendedor_no_id: uuid.UUID
    produto_id: uuid.UUID
    numero_venda: str
    cliente_nome: str
    data_venda: date
    valor_lancado: Decimal


class VendaUpdate(BaseModel):
    valor_lancado: Decimal


class VendaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    competencia_id: uuid.UUID
    vendedor_no_id: uuid.UUID
    produto_id: uuid.UUID
    numero_venda: str
    cliente_nome: str
    data_venda: date
    tipo_medida: TipoMedida
    valor_lancado: Decimal
    origem: OrigemVenda
    lancado_por: uuid.UUID
    lancado_em: datetime


class VendaHistoricoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    venda_id: uuid.UUID
    valor_anterior: Decimal
    usuario_id: uuid.UUID
    alterado_em: datetime
    acao: AcaoVendaHistorico
