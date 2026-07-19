from decimal import Decimal
from pydantic import BaseModel, ConfigDict, field_validator


class MetaItem(BaseModel):
    produto_id: int
    valor: Decimal

    @field_validator("valor")
    @classmethod
    def _v(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("valor nao pode ser negativo")
        return v


class MetaLoteCreate(BaseModel):
    vendedor_id: int
    ano: int
    mes: int
    itens: list[MetaItem]

    @field_validator("mes")
    @classmethod
    def _m(cls, v: int) -> int:
        if not 1 <= v <= 12:
            raise ValueError("mes deve estar entre 1 e 12")
        return v


class MetaUpdate(BaseModel):
    valor: Decimal

    @field_validator("valor")
    @classmethod
    def _v(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("valor nao pode ser negativo")
        return v


class MetaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    vendedor_id: int
    produto_id: int
    periodo_id: int
    valor: Decimal
    empresa_id: int
    unidade_id: int
    gerente_id: int
    ativo: bool


# ============ REPLICAÇÃO DE METAS ============

class ConflitoDeMeta(BaseModel):
    """Conflito detectado em uma meta"""
    produto_id: int
    produto_nome: str
    periodo_id: int
    periodo_ano: int
    periodo_mes: int
    valor_atual: Decimal
    valor_novo: Decimal


class ReplicarMetasRequest(BaseModel):
    """Request para replicar metas para múltiplos meses"""
    vendedor_id: int
    periodo_origem_id: int
    periodos_destino_ids: list[int]
    sobrescrever_conflitos: bool = False


class ReplicarMetasResponse(BaseModel):
    """Response da replicação de metas"""
    status: str  # "sucesso", "conflitos_detectados", "erro"
    mensagem: str
    metas_criadas: int
    metas_atualizadas: int = 0
    total_processadas: int
    conflitos: list[ConflitoDeMeta] = []
