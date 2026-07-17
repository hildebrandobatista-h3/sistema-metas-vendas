from datetime import date
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, field_validator


class RealizadoCreate(BaseModel):
    vendedor_id: int
    produto_id: int
    data_venda: date
    valor: Decimal
    descricao: str | None = None

    @field_validator("valor")
    @classmethod
    def _v(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("valor nao pode ser negativo")
        return v


class RealizadoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    vendedor_id: int
    produto_id: int
    data_venda: date
    valor: Decimal
    origem: str
    descricao: str | None
    empresa_id: int
    unidade_id: int
    gerente_id: int
    ativo: bool


class LinhaAtingimento(BaseModel):
    vendedor_id: int | None = None
    vendedor_nome: str | None = None
    produto_id: int | None = None
    produto_nome: str | None = None
    meta: Decimal
    realizado: Decimal
    percentual: float


class DashboardResposta(BaseModel):
    ano: int
    periodo_tipo: str
    periodo_ref: int
    meses: list[int]
    meta_total: Decimal
    realizado_total: Decimal
    percentual_total: float
    linhas: list[LinhaAtingimento]
