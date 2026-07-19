from datetime import date
from sqlalchemy import (ForeignKey, String, Integer, Numeric, Date,
                        CheckConstraint, UniqueConstraint, Index)
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base, AuditMixin, SoftDeleteMixin

MONEY = Numeric(15, 2)


class Produto(Base, AuditMixin, SoftDeleteMixin):
    __tablename__ = "produto"
    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)


class Periodo(Base, AuditMixin):
    __tablename__ = "periodo"
    __table_args__ = (
        UniqueConstraint("ano", "mes", name="uq_periodo_ano_mes"),
        CheckConstraint("mes BETWEEN 1 AND 12", name="ck_periodo_mes_valido"),
        CheckConstraint("ano BETWEEN 2000 AND 2100", name="ck_periodo_ano_valido"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    ano: Mapped[int] = mapped_column(Integer, nullable=False)
    mes: Mapped[int] = mapped_column(Integer, nullable=False)


class Meta(Base, AuditMixin, SoftDeleteMixin):
    __tablename__ = "meta"
    __table_args__ = (
        UniqueConstraint("vendedor_id", "produto_id", "periodo_id", name="uq_meta_vend_prod_per"),
        CheckConstraint("valor >= 0", name="ck_meta_valor_positivo"),
        Index("ix_meta_periodo", "periodo_id"),
        Index("ix_meta_vendedor", "vendedor_id"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    vendedor_id: Mapped[int] = mapped_column(ForeignKey("vendedor.id"), nullable=False)
    produto_id: Mapped[int] = mapped_column(ForeignKey("produto.id"), nullable=False)
    periodo_id: Mapped[int] = mapped_column(ForeignKey("periodo.id"), nullable=False)
    valor: Mapped[float] = mapped_column(MONEY, nullable=False)
    empresa_id: Mapped[int] = mapped_column(ForeignKey("empresa.id"), nullable=False)
    unidade_id: Mapped[int] = mapped_column(ForeignKey("unidade.id"), nullable=False)
    gerente_id: Mapped[int] = mapped_column(ForeignKey("gerente.id"), nullable=False)


class Realizado(Base, AuditMixin, SoftDeleteMixin):
    __tablename__ = "realizado"
    __table_args__ = (
        CheckConstraint("valor >= 0", name="ck_realizado_valor_positivo"),
        CheckConstraint("origem IN ('manual', 'nectar')", name="ck_realizado_origem"),
        Index("ix_realizado_vendedor_data", "vendedor_id", "data_venda"),
        Index("ix_realizado_produto", "produto_id"),
        Index("ix_realizado_data", "data_venda"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    vendedor_id: Mapped[int] = mapped_column(ForeignKey("vendedor.id"), nullable=False)
    produto_id: Mapped[int] = mapped_column(ForeignKey("produto.id"), nullable=False)
    data_venda: Mapped[date] = mapped_column(Date, nullable=False)
    valor: Mapped[float] = mapped_column(MONEY, nullable=False)
    origem: Mapped[str] = mapped_column(String(20), default="manual", server_default="manual", nullable=False)
    descricao: Mapped[str | None] = mapped_column(String(255), nullable=True)
    empresa_id: Mapped[int] = mapped_column(ForeignKey("empresa.id"), nullable=False)
    unidade_id: Mapped[int] = mapped_column(ForeignKey("unidade.id"), nullable=False)
    gerente_id: Mapped[int] = mapped_column(ForeignKey("gerente.id"), nullable=False)
    periodo_id: Mapped[int | None] = mapped_column(ForeignKey("periodo.id"), nullable=True)

    # Dados de Oportunidade/Cliente
    numero_oportunidade: Mapped[str | None] = mapped_column(String(10), nullable=True)
    numero_proposta: Mapped[str | None] = mapped_column(String(10), nullable=True)
    codigo_cliente: Mapped[str | None] = mapped_column(String(10), nullable=True)
    cnpj: Mapped[str | None] = mapped_column(String(18), nullable=True)
    razao_social: Mapped[str | None] = mapped_column(String(255), nullable=True)
    nome_fantasia: Mapped[str | None] = mapped_column(String(255), nullable=True)
