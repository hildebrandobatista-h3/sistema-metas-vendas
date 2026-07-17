from pydantic import BaseModel, ConfigDict, field_validator


class _Out(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class EmpresaCreate(BaseModel):
    nome: str

    @field_validator("nome")
    @classmethod
    def _nome_nao_vazio(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("nome nao pode ser vazio")
        return v


class EmpresaOut(_Out):
    id: int
    nome: str
    ativo: bool


class UnidadeCreate(BaseModel):
    empresa_id: int
    nome: str

    @field_validator("nome")
    @classmethod
    def _n(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("nome nao pode ser vazio")
        return v


class UnidadeOut(_Out):
    id: int
    empresa_id: int
    nome: str
    ativo: bool


class GerenteCreate(BaseModel):
    unidade_id: int
    nome: str

    @field_validator("nome")
    @classmethod
    def _n(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("nome nao pode ser vazio")
        return v


class GerenteOut(_Out):
    id: int
    unidade_id: int
    nome: str
    ativo: bool


class VendedorCreate(BaseModel):
    gerente_id: int
    nome: str
    ref_externa: str | None = None

    @field_validator("nome")
    @classmethod
    def _n(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("nome nao pode ser vazio")
        return v


class VendedorOut(_Out):
    id: int
    gerente_id: int
    nome: str
    ref_externa: str | None
    ativo: bool


class ProdutoCreate(BaseModel):
    nome: str

    @field_validator("nome")
    @classmethod
    def _n(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("nome nao pode ser vazio")
        return v


class ProdutoOut(_Out):
    id: int
    nome: str
    ativo: bool
