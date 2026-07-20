from pydantic import BaseModel, Field
from datetime import datetime

class ParamIntegracaoBase(BaseModel):
    tipo_integracao: str = Field(..., description="Tipo de integração (ex: nectar_crm)")
    token: str = Field(..., description="Token/API key")
    endpoint_base: str = Field(..., description="URL base da API")
    ativo: bool = True

class ParamIntegracaoCreate(ParamIntegracaoBase):
    pass

class ParamIntegracaoUpdate(BaseModel):
    token: str | None = None
    endpoint_base: str | None = None
    ativo: bool | None = None

class ParamIntegracaoOut(ParamIntegracaoBase):
    id: int
    ultima_sincronizacao: datetime | None = None
    status_ultimo_teste: str | None = None
    criado_em: datetime
    atualizado_em: datetime

    model_config = {"from_attributes": True}

class TestarConexaoRequest(BaseModel):
    tipo_integracao: str
    token: str
    endpoint_base: str

class TestarConexaoResponse(BaseModel):
    sucesso: bool
    mensagem: str
    dados_amostra: dict | None = None
