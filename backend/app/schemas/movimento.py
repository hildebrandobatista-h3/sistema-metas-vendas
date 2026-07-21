from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, field_validator


class RealizadoCreate(BaseModel):
    vendedor_id: int
    produto_id: int
    data_venda: date
    valor: Decimal
    numero_oportunidade: str | None = None
    numero_proposta: str | None = None
    codigo_cliente: str | None = None
    cnpj: str | None = None
    razao_social: str | None = None
    nome_fantasia: str | None = None
    descricao: str | None = None
    origem: str = "manual"
    periodo_id: int | None = None

    @field_validator("valor")
    @classmethod
    def _v(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("valor nao pode ser negativo")
        return v


class RealizadoUpdate(BaseModel):
    valor: Decimal | None = None
    descricao: str | None = None
    numero_oportunidade: str | None = None
    numero_proposta: str | None = None
    codigo_cliente: str | None = None
    cnpj: str | None = None
    razao_social: str | None = None
    nome_fantasia: str | None = None
    data_venda: date | None = None


class RealizadoResponse(BaseModel):
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
    periodo_id: int | None
    numero_oportunidade: str | None
    numero_proposta: str | None
    codigo_cliente: str | None
    cnpj: str | None
    razao_social: str | None
    nome_fantasia: str | None
    ativo: bool


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
    criado_em: datetime | None
    atualizado_em: datetime | None
    criado_por: int | None
    atualizado_por: int | None


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
