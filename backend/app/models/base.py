from datetime import datetime, timezone
from sqlalchemy import DateTime, Integer, Boolean, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class AuditMixin:
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, server_default=func.now(), nullable=False)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow,
        server_default=func.now(), nullable=False)
    criado_por: Mapped[int | None] = mapped_column(Integer, nullable=True)
    atualizado_por: Mapped[int | None] = mapped_column(Integer, nullable=True)


class SoftDeleteMixin:
    ativo: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="true", nullable=False)
