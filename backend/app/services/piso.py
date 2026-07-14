from __future__ import annotations

import uuid
from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.enums import TipoMedida
from app.models.meta import Meta
from app.services.arvore import get_filhos_diretos


@dataclass
class ViolacaoPiso:
    estrutura_no_id: uuid.UUID
    produto_id: uuid.UUID
    tipo_medida: TipoMedida
    meta_pai: Decimal
    soma_filhos: Decimal

    @property
    def gap(self) -> Decimal:
        return self.meta_pai - self.soma_filhos


def verificar_piso_no(
    db: Session, competencia_id: uuid.UUID, estrutura_no_id: uuid.UUID, produto_id: uuid.UUID
) -> ViolacaoPiso | None:
    """Verifica o piso de um nó específico para um produto: soma das metas dos
    filhos diretos (qualquer status) deve ser >= à meta do próprio nó.
    Nós-folha (sem filhos, ex. vendedor) não têm regra de piso — retorna None.
    Nó sem meta própria para este produto também retorna None (nada a validar).
    """
    meta_pai = (
        db.query(Meta)
        .filter(
            Meta.estrutura_no_id == estrutura_no_id,
            Meta.competencia_id == competencia_id,
            Meta.produto_id == produto_id,
        )
        .first()
    )
    if meta_pai is None:
        return None

    filhos = get_filhos_diretos(db, estrutura_no_id)
    if not filhos:
        return None

    filhos_ids = [f.id for f in filhos]
    metas_filhos = (
        db.query(Meta)
        .filter(
            Meta.estrutura_no_id.in_(filhos_ids),
            Meta.competencia_id == competencia_id,
            Meta.produto_id == produto_id,
        )
        .all()
    )
    soma_filhos = sum((m.valor_meta for m in metas_filhos), Decimal("0"))

    if soma_filhos < meta_pai.valor_meta:
        return ViolacaoPiso(
            estrutura_no_id=estrutura_no_id,
            produto_id=produto_id,
            tipo_medida=meta_pai.tipo_medida,
            meta_pai=meta_pai.valor_meta,
            soma_filhos=soma_filhos,
        )
    return None


def verificar_piso_meta(db: Session, meta: Meta) -> ViolacaoPiso | None:
    return verificar_piso_no(db, meta.competencia_id, meta.estrutura_no_id, meta.produto_id)


def verificar_piso_competencia(db: Session, competencia_id: uuid.UUID) -> list[ViolacaoPiso]:
    """Checa o piso de TODOS os nós/produtos com meta nesta competência — usado
    na publicação em bloco da competência inteira."""
    metas = db.query(Meta).filter(Meta.competencia_id == competencia_id).all()
    violacoes: list[ViolacaoPiso] = []
    for meta in metas:
        violacao = verificar_piso_no(db, competencia_id, meta.estrutura_no_id, meta.produto_id)
        if violacao is not None:
            violacoes.append(violacao)
    return violacoes
