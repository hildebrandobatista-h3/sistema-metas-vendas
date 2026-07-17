"""Mapeamento leve (SQLAlchemy Core, não ORM) das views de dashboard —
somente leitura, por isso não usam Base/declarative_base."""
from __future__ import annotations

from sqlalchemy import Numeric, String, Uuid, column, table

vw_atingimento = table(
    "vw_atingimento",
    column("meta_id", Uuid),
    column("estrutura_no_id", Uuid),
    column("competencia_id", Uuid),
    column("produto_id", Uuid),
    column("tipo_medida", String),
    column("meta_status", String),
    column("meta", Numeric),
    column("realizado", Numeric),
)

vw_estrutura_fechamento = table(
    "vw_estrutura_fechamento",
    column("ancestral_id", Uuid),
    column("descendente_id", Uuid),
)
