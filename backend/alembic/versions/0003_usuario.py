"""tabela usuario (autenticacao)

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-07-17
"""
from alembic import op
import sqlalchemy as sa

revision = "b2c3d4e5f6a7"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "usuario",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("login", sa.String(60), nullable=False, unique=True),
        sa.Column("senha_hash", sa.String(255), nullable=False),
        sa.Column("perfil", sa.String(20), nullable=False),
        sa.Column("nome", sa.String(120), nullable=False),
        sa.Column("gerente_id", sa.Integer(), sa.ForeignKey("gerente.id"), nullable=True),
        sa.Column("vendedor_id", sa.Integer(), sa.ForeignKey("vendedor.id"), nullable=True),
        sa.Column("ativo", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("criado_por", sa.Integer(), nullable=True),
        sa.Column("atualizado_por", sa.Integer(), nullable=True),
        sa.CheckConstraint("perfil IN ('admin','gerente','vendedor')", name="ck_usuario_perfil"),
    )


def downgrade():
    op.drop_table("usuario")
