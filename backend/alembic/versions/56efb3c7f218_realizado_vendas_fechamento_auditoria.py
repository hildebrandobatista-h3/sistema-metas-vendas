"""realizado vendas fechamento auditoria

Revision ID: 56efb3c7f218
Revises: e6a6c8ea75ad
Create Date: 2026-07-14 19:09:03.100417

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '56efb3c7f218'
down_revision: Union[str, None] = 'e6a6c8ea75ad'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "venda",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("competencia_id", sa.Uuid(), sa.ForeignKey("competencia.id"), nullable=False),
        sa.Column("vendedor_no_id", sa.Uuid(), sa.ForeignKey("estrutura_no.id"), nullable=False),
        sa.Column("produto_id", sa.Uuid(), sa.ForeignKey("produto.id"), nullable=False),
        sa.Column("numero_venda", sa.String(50), nullable=False, unique=True),
        sa.Column("cliente_nome", sa.String(200), nullable=False),
        sa.Column("data_venda", sa.Date(), nullable=False),
        # Reaproveita o tipo "tipo_medida" já criado na migration anterior (tabela meta).
        sa.Column(
            "tipo_medida",
            sa.Enum("VALOR", "QUANTIDADE", name="tipo_medida", create_type=False),
            nullable=False,
        ),
        sa.Column("valor_lancado", sa.Numeric(14, 2), nullable=False),
        sa.Column(
            "origem",
            sa.Enum("MANUAL", "INTEGRACAO", name="origem_venda"),
            nullable=False,
            server_default="MANUAL",
        ),
        sa.Column("lancado_por", sa.Uuid(), sa.ForeignKey("usuario.id"), nullable=False),
        sa.Column("lancado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "venda_historico",
        sa.Column("id", sa.Uuid(), primary_key=True),
        # Sem FK para venda.id — exclusão de venda é definitiva (hard delete)
        # e este histórico precisa sobreviver a ela.
        sa.Column("venda_id", sa.Uuid(), nullable=False),
        sa.Column("valor_anterior", sa.Numeric(14, 2), nullable=False),
        sa.Column("usuario_id", sa.Uuid(), sa.ForeignKey("usuario.id"), nullable=False),
        sa.Column("alterado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column(
            "acao", sa.Enum("EDICAO", "EXCLUSAO", name="acao_venda_historico"), nullable=False
        ),
    )

    op.create_table(
        "fechamento_evento",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("competencia_id", sa.Uuid(), sa.ForeignKey("competencia.id"), nullable=False),
        sa.Column("acao", sa.Enum("FECHOU", "REABRIU", name="acao_fechamento"), nullable=False),
        sa.Column("usuario_id", sa.Uuid(), sa.ForeignKey("usuario.id"), nullable=False),
        sa.Column(
            "executado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column("observacao", sa.String(500), nullable=True),
    )

    op.create_table(
        "log_auditoria",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("entidade", sa.String(50), nullable=False),
        sa.Column("entidade_id", sa.Uuid(), nullable=False),
        sa.Column("acao", sa.String(50), nullable=False),
        sa.Column("usuario_id", sa.Uuid(), sa.ForeignKey("usuario.id"), nullable=False),
        sa.Column("dados_antes", sa.JSON(), nullable=True),
        sa.Column("dados_depois", sa.JSON(), nullable=True),
        sa.Column("ocorrido_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("log_auditoria")
    op.drop_table("fechamento_evento")
    op.drop_table("venda_historico")
    op.drop_table("venda")

    bind = op.get_bind()
    sa.Enum(name="acao_fechamento").drop(bind, checkfirst=True)
    sa.Enum(name="acao_venda_historico").drop(bind, checkfirst=True)
    sa.Enum(name="origem_venda").drop(bind, checkfirst=True)
    # "tipo_medida" NÃO é removido aqui — pertence à migration anterior e
    # ainda é usado pela tabela `meta`.
