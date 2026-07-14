from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.models.log_auditoria import LogAuditoria


def registrar(
    db: Session,
    *,
    entidade: str,
    entidade_id: uuid.UUID,
    acao: str,
    usuario_id: uuid.UUID,
    dados_antes: Optional[dict] = None,
    dados_depois: Optional[dict] = None,
) -> None:
    db.add(
        LogAuditoria(
            entidade=entidade,
            entidade_id=entidade_id,
            acao=acao,
            usuario_id=usuario_id,
            dados_antes=dados_antes,
            dados_depois=dados_depois,
        )
    )
