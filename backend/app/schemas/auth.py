from __future__ import annotations

import uuid
from typing import Optional

from pydantic import BaseModel

from app.models.enums import PapelUsuario


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MeResponse(BaseModel):
    id: uuid.UUID
    nome: str
    email: str
    papel: PapelUsuario
    empresa_id: Optional[uuid.UUID]
    estrutura_no_id: Optional[uuid.UUID]
