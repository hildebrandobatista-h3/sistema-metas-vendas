"""adiciona tabela param_integracao para gerenciar credenciais de integrações

Revision ID: c4d5e6f7a8b9
Revises: b2c3d4e5f6a7
Create Date: 2026-07-20
"""
from alembic import op
import sqlalchemy as sa

revision = "c4d5e6f7a8b9"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "param_integracao",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tipo_integracao", sa.String(50), nullable=False),
        sa.Column("token", sa.String(1000), nullable=False),
        sa.Column("endpoint_base", sa.String(255), nullable=False),
        sa.Column("ativo", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("ultima_sincronizacao", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status_ultimo_teste", sa.String(20), nullable=True),
        sa.Column("mensagem_erro", sa.String(500), nullable=True),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("criado_por", sa.Integer(), nullable=True),
        sa.Column("atualizado_por", sa.Integer(), nullable=True),
        sa.UniqueConstraint("tipo_integracao", name="uq_param_integracao_tipo"),
    )


def downgrade():
    op.drop_table("param_integracao")
