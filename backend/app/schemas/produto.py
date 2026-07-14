from __future__ import annotations

import uuid

from pydantic import BaseModel, ConfigDict


class ProdutoCreate(BaseModel):
    empresa_id: uuid.UUID
    nome: str


class ProdutoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    empresa_id: uuid.UUID
    nome: str
    ativo: bool
