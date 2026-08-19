"""adiciona data_limite, funil_venda e etapa em oportunidade_nectar

Revision ID: e7f8a9b0c1d2
Revises: d6e7f8a9b0c1
Create Date: 2026-08-18
"""
from alembic import op
import sqlalchemy as sa

revision = "e7f8a9b0c1d2"
down_revision = "d6e7f8a9b0c1"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("oportunidade_nectar", sa.Column("data_limite", sa.DateTime(timezone=True), nullable=True))
    op.add_column("oportunidade_nectar", sa.Column("funil_venda", sa.String(255), nullable=True))
    op.add_column("oportunidade_nectar", sa.Column("etapa", sa.String(255), nullable=True))


def downgrade():
    op.drop_column("oportunidade_nectar", "etapa")
    op.drop_column("oportunidade_nectar", "funil_venda")
    op.drop_column("oportunidade_nectar", "data_limite")
