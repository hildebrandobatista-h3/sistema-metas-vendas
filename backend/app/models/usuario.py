from sqlalchemy import String, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base, AuditMixin, SoftDeleteMixin


class Usuario(Base, AuditMixin, SoftDeleteMixin):
    __tablename__ = "usuario"
    __table_args__ = (
        CheckConstraint("perfil IN ('admin','gerente','vendedor')", name="ck_usuario_perfil"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    login: Mapped[str] = mapped_column(String(60), nullable=False, unique=True)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    perfil: Mapped[str] = mapped_column(String(20), nullable=False)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    gerente_id: Mapped[int | None] = mapped_column(ForeignKey("gerente.id"), nullable=True)
    vendedor_id: Mapped[int | None] = mapped_column(ForeignKey("vendedor.id"), nullable=True)
