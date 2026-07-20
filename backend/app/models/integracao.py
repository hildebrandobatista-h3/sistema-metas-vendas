from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base, AuditMixin

class ParamIntegracao(Base, AuditMixin):
    """Parâmetros de integração com sistemas externos (NectarCRM, etc)"""
    __tablename__ = "param_integracao"
    __table_args__ = (
        UniqueConstraint("tipo_integracao", name="uq_param_integracao_tipo"),
    )
    
    id: Mapped[int] = mapped_column(primary_key=True)
    tipo_integracao: Mapped[str] = mapped_column(String(50), nullable=False)
    token: Mapped[str] = mapped_column(String(1000), nullable=False)
    endpoint_base: Mapped[str] = mapped_column(String(255), nullable=False)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)
    
    ultima_sincronizacao: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status_ultimo_teste: Mapped[str | None] = mapped_column(String(20), nullable=True)
    mensagem_erro: Mapped[str | None] = mapped_column(String(500), nullable=True)
