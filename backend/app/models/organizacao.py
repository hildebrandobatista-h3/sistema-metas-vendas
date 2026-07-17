from sqlalchemy import ForeignKey, String, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, AuditMixin, SoftDeleteMixin


class Empresa(Base, AuditMixin, SoftDeleteMixin):
    __tablename__ = "empresa"
    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    unidades: Mapped[list["Unidade"]] = relationship(back_populates="empresa")


class Unidade(Base, AuditMixin, SoftDeleteMixin):
    __tablename__ = "unidade"
    __table_args__ = (
        UniqueConstraint("empresa_id", "nome", name="uq_unidade_empresa_nome"),
        Index("ix_unidade_empresa", "empresa_id"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    empresa_id: Mapped[int] = mapped_column(ForeignKey("empresa.id"), nullable=False)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    empresa: Mapped["Empresa"] = relationship(back_populates="unidades")
    gerentes: Mapped[list["Gerente"]] = relationship(back_populates="unidade")


class Gerente(Base, AuditMixin, SoftDeleteMixin):
    __tablename__ = "gerente"
    __table_args__ = (
        UniqueConstraint("unidade_id", "nome", name="uq_gerente_unidade_nome"),
        Index("ix_gerente_unidade", "unidade_id"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    unidade_id: Mapped[int] = mapped_column(ForeignKey("unidade.id"), nullable=False)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    unidade: Mapped["Unidade"] = relationship(back_populates="gerentes")
    vendedores: Mapped[list["Vendedor"]] = relationship(back_populates="gerente")


class Vendedor(Base, AuditMixin, SoftDeleteMixin):
    __tablename__ = "vendedor"
    __table_args__ = (
        UniqueConstraint("gerente_id", "nome", name="uq_vendedor_gerente_nome"),
        Index("ix_vendedor_gerente", "gerente_id"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    gerente_id: Mapped[int] = mapped_column(ForeignKey("gerente.id"), nullable=False)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    ref_externa: Mapped[str | None] = mapped_column(String(80), nullable=True)
    gerente: Mapped["Gerente"] = relationship(back_populates="vendedores")
