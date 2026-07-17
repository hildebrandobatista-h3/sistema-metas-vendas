from __future__ import annotations

import uuid
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.enums import PapelUsuario, TipoNo


class EmpresaCreate(BaseModel):
    razao_social: str
    cnpj: str


class EmpresaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    razao_social: str
    cnpj: str
    ativo: bool


class UnidadeCreate(BaseModel):
    empresa_id: uuid.UUID
    nome: str


class UnidadeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    empresa_id: uuid.UUID
    nome: str
    ativo: bool


class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    papel: PapelUsuario
    empresa_id: Optional[uuid.UUID] = None
    unidade_id: Optional[uuid.UUID] = None
    superior_id: Optional[uuid.UUID] = None


class UsuarioRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nome: str
    email: str
    papel: PapelUsuario
    empresa_id: Optional[uuid.UUID]
    unidade_id: Optional[uuid.UUID]
    superior_id: Optional[uuid.UUID]
    ativo: bool


class EstruturaNoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    empresa_id: uuid.UUID
    tipo: TipoNo
    no_pai_id: Optional[uuid.UUID]
    ref_id: uuid.UUID
    nome: str
