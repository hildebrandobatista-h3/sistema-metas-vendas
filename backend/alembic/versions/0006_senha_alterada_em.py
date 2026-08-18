"""adiciona senha_alterada_em a usuario para invalidar tokens apos troca de senha

Revision ID: c3d4e5f6a7b8
Revises: b4c5d6e7f8a9
Create Date: 2026-07-22
"""
from alembic import op
import sqlalchemy as sa

revision = "c3d4e5f6a7b8"
down_revision = "b4c5d6e7f8a9"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "usuario",
        sa.Column("senha_alterada_em", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade():
    op.drop_column("usuario", "senha_alterada_em")
