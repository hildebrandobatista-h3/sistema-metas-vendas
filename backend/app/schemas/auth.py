from pydantic import BaseModel, ConfigDict, field_validator


class LoginResposta(BaseModel):
    access_token: str
    token_type: str = "bearer"
    perfil: str
    nome: str


class UsuarioCreate(BaseModel):
    login: str
    senha: str
    perfil: str
    nome: str
    gerente_id: int | None = None
    vendedor_id: int | None = None

    @field_validator("login", "nome")
    @classmethod
    def _nao_vazio(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("campo obrigatorio")
        return v

    @field_validator("senha")
    @classmethod
    def _senha_forte(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("a senha deve ter ao menos 8 caracteres")
        return v

    @field_validator("perfil")
    @classmethod
    def _perfil_valido(cls, v: str) -> str:
        if v not in ("admin", "gerente", "vendedor"):
            raise ValueError("perfil deve ser admin, gerente ou vendedor")
        return v


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    login: str
    perfil: str
    nome: str
    gerente_id: int | None
    vendedor_id: int | None
    ativo: bool


class SenhaUpdate(BaseModel):
    senha: str

    @field_validator("senha")
    @classmethod
    def _s(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("a senha deve ter ao menos 8 caracteres")
        return v


class UsuarioUpdate(BaseModel):
    nome: str
    login: str
    perfil: str
    gerente_id: int | None = None
    vendedor_id: int | None = None
    senha: str | None = None

    @field_validator('nome', 'login')
    @classmethod
    def _nao_vazio(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('campo obrigatorio')
        return v

    @field_validator('perfil')
    @classmethod
    def _perfil_valido(cls, v: str) -> str:
        if v not in ('admin', 'gerente', 'vendedor'):
            raise ValueError('perfil deve ser admin, gerente ou vendedor')
        return v

    @field_validator('senha')
    @classmethod
    def _senha_forte(cls, v: str | None) -> str | None:
        if v is not None and v.strip() and len(v) < 8:
            raise ValueError('a senha deve ter ao menos 8 caracteres')
        return v
