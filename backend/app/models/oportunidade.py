from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Integer, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base, AuditMixin

class OportunidadeNectar(Base, AuditMixin):
    """Oportunidades ganhas sincronizadas do NectarCRM"""
    __tablename__ = "oportunidade_nectar"
    __table_args__ = (
        UniqueConstraint("param_integracao_id", "id_oportunidade_ext", name="uq_oportunidade_nectar"),
    )
    
    id: Mapped[int] = mapped_column(primary_key=True)
    param_integracao_id: Mapped[int] = mapped_column(ForeignKey("param_integracao.id"), nullable=False)
    
    # ID e dados da oportunidade no NectarCRM
    id_oportunidade_ext: Mapped[int] = mapped_column(Integer, nullable=False)
    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    cliente: Mapped[str | None] = mapped_column(String(255), nullable=True)
    valor: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    
    # Status da sincronização
    status_sincronizacao: Mapped[str] = mapped_column(String(20), default="pendente", nullable=False)  # pendente, mapeado, ignorado
    data_sincronizacao: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    mensagem_erro: Mapped[str | None] = mapped_column(String(500), nullable=True)
