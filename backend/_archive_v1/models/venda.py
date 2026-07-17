from __future__ import annotations

import uuid

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Numeric, String, Uuid
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import AcaoVendaHistorico, OrigemVenda, TipoMedida


class Venda(Base):
    __tablename__ = "venda"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    competencia_id = Column(Uuid, ForeignKey("competencia.id"), nullable=False)
    vendedor_no_id = Column(Uuid, ForeignKey("estrutura_no.id"), nullable=False)
    produto_id = Column(Uuid, ForeignKey("produto.id"), nullable=False)
    numero_venda = Column(String(50), nullable=False, unique=True)
    cliente_nome = Column(String(200), nullable=False)
    data_venda = Column(Date, nullable=False)
    tipo_medida = Column(Enum(TipoMedida, name="tipo_medida"), nullable=False)
    valor_lancado = Column(Numeric(14, 2), nullable=False)
    origem = Column(Enum(OrigemVenda, name="origem_venda"), nullable=False, default=OrigemVenda.MANUAL)
    lancado_por = Column(Uuid, ForeignKey("usuario.id"), nullable=False)
    lancado_em = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class VendaHistorico(Base):
    __tablename__ = "venda_historico"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    # Sem FK para venda.id: a exclusão de uma venda é definitiva (hard delete,
    # decisão confirmada) e o histórico precisa sobreviver a ela.
    venda_id = Column(Uuid, nullable=False)
    valor_anterior = Column(Numeric(14, 2), nullable=False)
    usuario_id = Column(Uuid, ForeignKey("usuario.id"), nullable=False)
    alterado_em = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    acao = Column(Enum(AcaoVendaHistorico, name="acao_venda_historico"), nullable=False)
