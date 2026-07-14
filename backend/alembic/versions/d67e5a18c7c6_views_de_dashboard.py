"""views de dashboard

Revision ID: d67e5a18c7c6
Revises: 56efb3c7f218
Create Date: 2026-07-14 19:21:01.992176

Camada de indicadores via VIEWS (sem data warehouse nem banco separado,
conforme escopo). SQL definido em app/core/views.py — compartilhado com o
setup de banco dos testes, que não passa pelo Alembic.
"""
from typing import Sequence, Union

from alembic import op

from app.core.views import VIEWS_CRIACAO, VIEWS_NOMES_REMOCAO

# revision identifiers, used by Alembic.
revision: str = 'd67e5a18c7c6'
down_revision: Union[str, None] = '56efb3c7f218'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for sql in VIEWS_CRIACAO:
        op.execute(sql)


def downgrade() -> None:
    for nome in VIEWS_NOMES_REMOCAO:
        op.execute(f"DROP VIEW {nome}")
