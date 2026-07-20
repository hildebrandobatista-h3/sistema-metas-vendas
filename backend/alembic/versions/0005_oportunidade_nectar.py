"""adiciona tabela oportunidade_nectar para sincronizar dados do NectarCRM

Revision ID: d5e6f7a8b9c0
Revises: c4d5e6f7a8b9
Create Date: 2026-07-20
"""
from alembic import op
import sqlalchemy as sa

revision = "d5e6f7a8b9c0"
down_revision = "c4d5e6f7a8b9"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "oportunidade_nectar",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("param_integracao_id", sa.Integer(), sa.ForeignKey("param_integracao.id"), nullable=False),
        sa.Column("id_oportunidade_ext", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(255), nullable=False),
        sa.Column("cliente", sa.String(255), nullable=True),
        sa.Column("valor", sa.Numeric(15, 2), nullable=True),
        sa.Column("status_sincronizacao", sa.String(20), server_default="pendente", nullable=False),
        sa.Column("data_sincronizacao", sa.DateTime(timezone=True), nullable=True),
        sa.Column("mensagem_erro", sa.String(500), nullable=True),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("criado_por", sa.Integer(), nullable=True),
        sa.Column("atualizado_por", sa.Integer(), nullable=True),
        sa.UniqueConstraint("param_integracao_id", "id_oportunidade_ext", name="uq_oportunidade_nectar"),
    )
    op.create_index("ix_oportunidade_nectar_param", "oportunidade_nectar", ["param_integracao_id"])
    op.create_index("ix_oportunidade_nectar_status", "oportunidade_nectar", ["status_sincronizacao"])


def downgrade():
    op.drop_index("ix_oportunidade_nectar_status", "oportunidade_nectar")
    op.drop_index("ix_oportunidade_nectar_param", "oportunidade_nectar")
    op.drop_table("oportunidade_nectar")
