from __future__ import annotations

import uuid
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.competencia import Competencia
from app.models.dashboard_views import vw_atingimento, vw_estrutura_fechamento
from app.models.estrutura_no import EstruturaNo


def _q(valor: Decimal) -> Decimal:
    """Normaliza para 2 casas decimais — views agregadas (SUM/COALESCE) não
    preservam a escala fixa da coluna original, sobretudo no SQLite."""
    return Decimal(valor).quantize(Decimal("0.01"))


def calcular_percentual(realizado: Decimal, meta: Decimal) -> Optional[Decimal]:
    """soma(realizado) / soma(meta) — nunca média de percentuais. None quando
    não há meta para dividir (não confundir com 0%)."""
    if meta is None or meta == 0:
        return None
    return (realizado / meta * 100).quantize(Decimal("0.01"))


@dataclass
class IndicadorNo:
    estrutura_no_id: uuid.UUID
    meta: Decimal
    realizado: Decimal

    @property
    def percentual(self) -> Optional[Decimal]:
        return calcular_percentual(self.realizado, self.meta)


def indicadores_filhos(
    db: Session, no_pai_id: uuid.UUID, competencia_id: uuid.UUID, produto_id: uuid.UUID
) -> list[IndicadorNo]:
    """Meta e realizado de cada FILHO DIRETO de no_pai_id, para um produto e
    uma competência — serve tanto para ranking quanto para navegação de nível
    (vendedor→gerente→diretor→unidade→empresa). Meta é a do próprio filho
    (não soma dos netos); realizado já vem somado subindo toda a subárvore
    de cada filho (via vw_realizado_no, embutida em vw_atingimento)."""
    filhos_ids = [
        row[0]
        for row in db.execute(
            select(EstruturaNo.id).where(EstruturaNo.no_pai_id == no_pai_id)
        ).all()
    ]
    if not filhos_ids:
        return []

    linhas = db.execute(
        select(vw_atingimento.c.estrutura_no_id, vw_atingimento.c.meta, vw_atingimento.c.realizado).where(
            vw_atingimento.c.estrutura_no_id.in_(filhos_ids),
            vw_atingimento.c.competencia_id == competencia_id,
            vw_atingimento.c.produto_id == produto_id,
        )
    ).all()

    por_no = {row.estrutura_no_id: row for row in linhas}
    resultado = []
    for filho_id in filhos_ids:
        linha = por_no.get(filho_id)
        meta = _q(linha.meta) if linha is not None else Decimal("0.00")
        realizado = _q(linha.realizado) if linha is not None else Decimal("0.00")
        resultado.append(IndicadorNo(estrutura_no_id=filho_id, meta=meta, realizado=realizado))
    return resultado


@dataclass
class PontoEvolucao:
    ano: int
    mes: int
    meta_acumulada: Decimal
    realizado_acumulado: Decimal

    @property
    def percentual(self) -> Optional[Decimal]:
        return calcular_percentual(self.realizado_acumulado, self.meta_acumulada)


def _meta_e_realizado_do_mes(
    db: Session, empresa_id: uuid.UUID, no_id: uuid.UUID, produto_id: uuid.UUID, ano: int, mes: int
) -> tuple[Decimal, Decimal]:
    competencia = (
        db.query(Competencia)
        .filter(Competencia.empresa_id == empresa_id, Competencia.ano == ano, Competencia.mes == mes)
        .first()
    )
    if competencia is None:
        return Decimal("0.00"), Decimal("0.00")

    linha = db.execute(
        select(vw_atingimento.c.meta, vw_atingimento.c.realizado).where(
            vw_atingimento.c.estrutura_no_id == no_id,
            vw_atingimento.c.competencia_id == competencia.id,
            vw_atingimento.c.produto_id == produto_id,
        )
    ).first()
    if linha is None:
        return Decimal("0.00"), Decimal("0.00")
    return _q(linha.meta), _q(linha.realizado)


def evolucao(
    db: Session,
    empresa_id: uuid.UUID,
    no_id: uuid.UUID,
    produto_id: uuid.UUID,
    ano: int,
    mes_inicio: int,
    mes_fim: int,
) -> list[PontoEvolucao]:
    """Realizado acumulado vs meta acumulada, mês a mês, dentro da janela
    [mes_inicio, mes_fim] de um mesmo ano (mês=1 mês; trimestre=3; semestre=6;
    ano=1-12)."""
    pontos: list[PontoEvolucao] = []
    meta_acum = Decimal("0")
    realizado_acum = Decimal("0")
    for mes in range(mes_inicio, mes_fim + 1):
        meta_mes, realizado_mes = _meta_e_realizado_do_mes(db, empresa_id, no_id, produto_id, ano, mes)
        meta_acum += meta_mes
        realizado_acum += realizado_mes
        pontos.append(
            PontoEvolucao(ano=ano, mes=mes, meta_acumulada=meta_acum, realizado_acumulado=realizado_acum)
        )
    return pontos


@dataclass
class JanelaIndicador:
    meta: Decimal
    realizado: Decimal
    tem_dado: bool

    @property
    def percentual(self) -> Optional[Decimal]:
        return calcular_percentual(self.realizado, self.meta)


def _soma_janela(
    db: Session,
    empresa_id: uuid.UUID,
    no_id: uuid.UUID,
    produto_id: uuid.UUID,
    ano: int,
    mes_inicio: int,
    mes_fim: int,
) -> JanelaIndicador:
    competencia_ids = [
        row[0]
        for row in db.execute(
            select(Competencia.id).where(
                Competencia.empresa_id == empresa_id,
                Competencia.ano == ano,
                Competencia.mes >= mes_inicio,
                Competencia.mes <= mes_fim,
            )
        ).all()
    ]
    if not competencia_ids:
        return JanelaIndicador(meta=Decimal("0.00"), realizado=Decimal("0.00"), tem_dado=False)

    resultado = db.execute(
        select(
            func.coalesce(func.sum(vw_atingimento.c.meta), 0),
            func.coalesce(func.sum(vw_atingimento.c.realizado), 0),
            func.count(vw_atingimento.c.meta_id),
        ).where(
            vw_atingimento.c.estrutura_no_id == no_id,
            vw_atingimento.c.produto_id == produto_id,
            vw_atingimento.c.competencia_id.in_(competencia_ids),
        )
    ).first()

    soma_meta, soma_realizado, qtd = resultado
    return JanelaIndicador(meta=_q(soma_meta), realizado=_q(soma_realizado), tem_dado=qtd > 0)


@dataclass
class ComparacaoYoY:
    atual: JanelaIndicador
    anterior: JanelaIndicador


def comparacao_yoy(
    db: Session,
    empresa_id: uuid.UUID,
    no_id: uuid.UUID,
    produto_id: uuid.UUID,
    ano: int,
    mes_inicio: int,
    mes_fim: int,
) -> ComparacaoYoY:
    """Janela atual vs mesma janela do ano anterior. Nasce vazia (tem_dado=False)
    até que o histórico daquele ano seja digitado — mesmo mecanismo de
    competência/meta/venda, só que para um ano passado."""
    atual = _soma_janela(db, empresa_id, no_id, produto_id, ano, mes_inicio, mes_fim)
    anterior = _soma_janela(db, empresa_id, no_id, produto_id, ano - 1, mes_inicio, mes_fim)
    return ComparacaoYoY(atual=atual, anterior=anterior)
