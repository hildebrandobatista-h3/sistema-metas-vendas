"""nucleo estrutura metas competencia

Revision ID: e6a6c8ea75ad
Revises:
Create Date: 2026-07-14 18:50:58.619329

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e6a6c8ea75ad'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "empresa",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("razao_social", sa.String(200), nullable=False),
        sa.Column("cnpj", sa.String(18), nullable=False, unique=True),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("criado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "unidade_negocio",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("empresa_id", sa.Uuid(), sa.ForeignKey("empresa.id"), nullable=False),
        sa.Column("nome", sa.String(150), nullable=False),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
    )

    op.create_table(
        "usuario",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("empresa_id", sa.Uuid(), sa.ForeignKey("empresa.id"), nullable=True),
        sa.Column("nome", sa.String(150), nullable=False),
        sa.Column("email", sa.String(200), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(200), nullable=False),
        sa.Column(
            "papel",
            sa.Enum("ADMIN", "DIRETOR", "GERENTE", "VENDEDOR", name="papel_usuario"),
            nullable=False,
        ),
        sa.Column("unidade_id", sa.Uuid(), sa.ForeignKey("unidade_negocio.id"), nullable=True),
        sa.Column("superior_id", sa.Uuid(), sa.ForeignKey("usuario.id"), nullable=True),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
    )

    op.create_table(
        "produto",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("empresa_id", sa.Uuid(), sa.ForeignKey("empresa.id"), nullable=False),
        sa.Column("nome", sa.String(150), nullable=False),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
    )

    op.create_table(
        "estrutura_no",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("empresa_id", sa.Uuid(), sa.ForeignKey("empresa.id"), nullable=False),
        sa.Column(
            "tipo",
            sa.Enum("EMPRESA", "UNIDADE", "DIRETOR", "GERENTE", "VENDEDOR", name="tipo_no"),
            nullable=False,
        ),
        sa.Column("no_pai_id", sa.Uuid(), sa.ForeignKey("estrutura_no.id"), nullable=True),
        sa.Column("ref_id", sa.Uuid(), nullable=False),
    )

    op.create_table(
        "competencia",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("empresa_id", sa.Uuid(), sa.ForeignKey("empresa.id"), nullable=False),
        sa.Column("ano", sa.Integer(), nullable=False),
        sa.Column("mes", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("ABERTA", "PUBLICADA", "FECHADA", name="status_competencia"),
            nullable=False,
            server_default="ABERTA",
        ),
        sa.Column("fechada_em", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reaberta_em", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("empresa_id", "ano", "mes", name="uq_competencia_empresa_ano_mes"),
    )

    op.create_table(
        "meta",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("competencia_id", sa.Uuid(), sa.ForeignKey("competencia.id"), nullable=False),
        sa.Column("estrutura_no_id", sa.Uuid(), sa.ForeignKey("estrutura_no.id"), nullable=False),
        sa.Column("produto_id", sa.Uuid(), sa.ForeignKey("produto.id"), nullable=False),
        sa.Column(
            "tipo_medida",
            sa.Enum("VALOR", "QUANTIDADE", name="tipo_medida"),
            nullable=False,
        ),
        sa.Column("valor_meta", sa.Numeric(14, 2), nullable=False),
        sa.Column(
            "status",
            sa.Enum("RASCUNHO", "PUBLICADA", name="status_meta"),
            nullable=False,
            server_default="RASCUNHO",
        ),
        sa.UniqueConstraint(
            "competencia_id", "estrutura_no_id", "produto_id", name="uq_meta_competencia_no_produto"
        ),
    )

    op.create_table(
        "meta_historico",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("meta_id", sa.Uuid(), sa.ForeignKey("meta.id"), nullable=False),
        sa.Column("valor_anterior", sa.Numeric(14, 2), nullable=True),
        sa.Column("valor_novo", sa.Numeric(14, 2), nullable=False),
        sa.Column("usuario_id", sa.Uuid(), sa.ForeignKey("usuario.id"), nullable=False),
        sa.Column("alterado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("motivo", sa.String(500), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("meta_historico")
    op.drop_table("meta")
    op.drop_table("competencia")
    op.drop_table("estrutura_no")
    op.drop_table("produto")
    op.drop_table("usuario")
    op.drop_table("unidade_negocio")
    op.drop_table("empresa")

    bind = op.get_bind()
    sa.Enum(name="status_meta").drop(bind, checkfirst=True)
    sa.Enum(name="tipo_medida").drop(bind, checkfirst=True)
    sa.Enum(name="status_competencia").drop(bind, checkfirst=True)
    sa.Enum(name="tipo_no").drop(bind, checkfirst=True)
    sa.Enum(name="papel_usuario").drop(bind, checkfirst=True)
