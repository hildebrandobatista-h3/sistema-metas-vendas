"""schema inicial metas v2

Revision ID: 70a58bee243a
Revises:
Create Date: 2026-07-17
"""
from alembic import op
import sqlalchemy as sa

revision = "70a58bee243a"
down_revision = None
branch_labels = None
depends_on = None


def _audit():
    return [
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("criado_por", sa.Integer(), nullable=True),
        sa.Column("atualizado_por", sa.Integer(), nullable=True),
    ]


def _ativo():
    return sa.Column("ativo", sa.Boolean(), server_default=sa.text("true"), nullable=False)


def upgrade():
    op.create_table("empresa",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nome", sa.String(120), nullable=False, unique=True),
        _ativo(), *_audit())
    op.create_table("unidade",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("empresa_id", sa.Integer(), sa.ForeignKey("empresa.id"), nullable=False),
        sa.Column("nome", sa.String(120), nullable=False),
        _ativo(), *_audit(),
        sa.UniqueConstraint("empresa_id", "nome", name="uq_unidade_empresa_nome"))
    op.create_index("ix_unidade_empresa", "unidade", ["empresa_id"])
    op.create_table("gerente",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("unidade_id", sa.Integer(), sa.ForeignKey("unidade.id"), nullable=False),
        sa.Column("nome", sa.String(120), nullable=False),
        _ativo(), *_audit(),
        sa.UniqueConstraint("unidade_id", "nome", name="uq_gerente_unidade_nome"))
    op.create_index("ix_gerente_unidade", "gerente", ["unidade_id"])
    op.create_table("vendedor",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("gerente_id", sa.Integer(), sa.ForeignKey("gerente.id"), nullable=False),
        sa.Column("nome", sa.String(120), nullable=False),
        sa.Column("ref_externa", sa.String(80), nullable=True),
        _ativo(), *_audit(),
        sa.UniqueConstraint("gerente_id", "nome", name="uq_vendedor_gerente_nome"))
    op.create_index("ix_vendedor_gerente", "vendedor", ["gerente_id"])
    op.create_table("produto",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nome", sa.String(80), nullable=False, unique=True),
        _ativo(), *_audit())
    op.create_table("periodo",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("ano", sa.Integer(), nullable=False),
        sa.Column("mes", sa.Integer(), nullable=False),
        *_audit(),
        sa.UniqueConstraint("ano", "mes", name="uq_periodo_ano_mes"),
        sa.CheckConstraint("mes BETWEEN 1 AND 12", name="ck_periodo_mes_valido"),
        sa.CheckConstraint("ano BETWEEN 2000 AND 2100", name="ck_periodo_ano_valido"))
    op.create_table("meta",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("vendedor_id", sa.Integer(), sa.ForeignKey("vendedor.id"), nullable=False),
        sa.Column("produto_id", sa.Integer(), sa.ForeignKey("produto.id"), nullable=False),
        sa.Column("periodo_id", sa.Integer(), sa.ForeignKey("periodo.id"), nullable=False),
        sa.Column("valor", sa.Numeric(15, 2), nullable=False),
        sa.Column("empresa_id", sa.Integer(), sa.ForeignKey("empresa.id"), nullable=False),
        sa.Column("unidade_id", sa.Integer(), sa.ForeignKey("unidade.id"), nullable=False),
        sa.Column("gerente_id", sa.Integer(), sa.ForeignKey("gerente.id"), nullable=False),
        _ativo(), *_audit(),
        sa.UniqueConstraint("vendedor_id", "produto_id", "periodo_id", name="uq_meta_vend_prod_per"),
        sa.CheckConstraint("valor >= 0", name="ck_meta_valor_positivo"))
    op.create_index("ix_meta_periodo", "meta", ["periodo_id"])
    op.create_index("ix_meta_vendedor", "meta", ["vendedor_id"])
    op.create_table("realizado",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("vendedor_id", sa.Integer(), sa.ForeignKey("vendedor.id"), nullable=False),
        sa.Column("produto_id", sa.Integer(), sa.ForeignKey("produto.id"), nullable=False),
        sa.Column("data_venda", sa.Date(), nullable=False),
        sa.Column("valor", sa.Numeric(15, 2), nullable=False),
        sa.Column("origem", sa.String(20), server_default="manual", nullable=False),
        sa.Column("descricao", sa.String(255), nullable=True),
        sa.Column("empresa_id", sa.Integer(), sa.ForeignKey("empresa.id"), nullable=False),
        sa.Column("unidade_id", sa.Integer(), sa.ForeignKey("unidade.id"), nullable=False),
        sa.Column("gerente_id", sa.Integer(), sa.ForeignKey("gerente.id"), nullable=False),
        _ativo(), *_audit(),
        sa.CheckConstraint("valor >= 0", name="ck_realizado_valor_positivo"),
        sa.CheckConstraint("origem IN ('manual','nectar')", name="ck_realizado_origem"))
    op.create_index("ix_realizado_vendedor_data", "realizado", ["vendedor_id", "data_venda"])
    op.create_index("ix_realizado_produto", "realizado", ["produto_id"])
    op.create_index("ix_realizado_data", "realizado", ["data_venda"])


def downgrade():
    for t in ["realizado", "meta", "periodo", "produto", "vendedor", "gerente", "unidade", "empresa"]:
        op.drop_table(t)
