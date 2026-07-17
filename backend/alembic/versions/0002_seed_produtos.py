"""seed produtos iniciais

Revision ID: a1b2c3d4e5f6
Revises: 70a58bee243a
Create Date: 2026-07-17
"""
from alembic import op
import sqlalchemy as sa

revision = "a1b2c3d4e5f6"
down_revision = "70a58bee243a"
branch_labels = None
depends_on = None

PRODUTOS = ["Setup", "MRR", "Projeto", "NREC", "REC", "SCS", "AMS"]


def upgrade():
    produto = sa.table("produto",
        sa.column("nome", sa.String),
        sa.column("ativo", sa.Boolean))
    op.bulk_insert(produto, [{"nome": n, "ativo": True} for n in PRODUTOS])


def downgrade():
    nomes = ",".join(f"'{n}'" for n in PRODUTOS)
    op.execute(f"DELETE FROM produto WHERE nome IN ({nomes})")
