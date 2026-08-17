"""adiciona coluna responsavel em oportunidade_nectar (separar de mensagem_erro)

Revision ID: d6e7f8a9b0c1
Revises: d5e6f7a8b9c0
Create Date: 2026-08-17
"""
from alembic import op
import sqlalchemy as sa

revision = "d6e7f8a9b0c1"
down_revision = "d5e6f7a8b9c0"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "oportunidade_nectar",
        sa.Column("responsavel", sa.String(255), nullable=True),
    )


def downgrade():
    op.drop_column("oportunidade_nectar", "responsavel")
