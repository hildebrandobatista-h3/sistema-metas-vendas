from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.core.scoping import verificar_escopo
from app.models.usuario import Usuario
from app.schemas.competencia import ViolacaoPisoRead
from app.schemas.dashboard import (
    ComparacaoYoYRead,
    IndicadorNoRead,
    JanelaIndicadorRead,
    PontoEvolucaoRead,
)
from app.services.dashboard import comparacao_yoy, evolucao, indicadores_filhos
from app.services.piso import verificar_piso_competencia

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/nivel/{no_pai_id}", response_model=list[IndicadorNoRead])
def nivel(
    no_pai_id: uuid.UUID,
    competencia_id: uuid.UUID = Query(...),
    produto_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> list[IndicadorNoRead]:
    """Meta/realizado/% de cada filho direto de no_pai_id — ranking dentro do
    nível e navegação vendedor→gerente→diretor→unidade→empresa, um passo por
    chamada."""
    verificar_escopo(db, usuario, no_pai_id)
    indicadores = indicadores_filhos(db, no_pai_id, competencia_id, produto_id)
    indicadores.sort(key=lambda i: (i.percentual is None, -(i.percentual or 0)))
    return [
        IndicadorNoRead(
            estrutura_no_id=i.estrutura_no_id, meta=i.meta, realizado=i.realizado, percentual=i.percentual
        )
        for i in indicadores
    ]


@router.get("/evolucao", response_model=list[PontoEvolucaoRead])
def rota_evolucao(
    empresa_id: uuid.UUID = Query(...),
    no_id: uuid.UUID = Query(...),
    produto_id: uuid.UUID = Query(...),
    ano: int = Query(...),
    mes_inicio: int = Query(..., ge=1, le=12),
    mes_fim: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> list[PontoEvolucaoRead]:
    """Realizado acumulado vs meta acumulada mês a mês dentro da janela —
    mês (mes_inicio=mes_fim), trimestre (3 meses), semestre (6), ano (1-12)."""
    verificar_escopo(db, usuario, no_id)
    pontos = evolucao(db, empresa_id, no_id, produto_id, ano, mes_inicio, mes_fim)
    return [
        PontoEvolucaoRead(
            ano=p.ano,
            mes=p.mes,
            meta_acumulada=p.meta_acumulada,
            realizado_acumulado=p.realizado_acumulado,
            percentual=p.percentual,
        )
        for p in pontos
    ]


@router.get("/yoy", response_model=ComparacaoYoYRead)
def rota_yoy(
    empresa_id: uuid.UUID = Query(...),
    no_id: uuid.UUID = Query(...),
    produto_id: uuid.UUID = Query(...),
    ano: int = Query(...),
    mes_inicio: int = Query(..., ge=1, le=12),
    mes_fim: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> ComparacaoYoYRead:
    """Janela atual vs mesma janela do ano anterior. Nasce vazia (tem_dado=False
    no lado 'anterior') até que alguém digite o histórico daquele ano — mesmo
    mecanismo de competência/meta/venda, aplicado a um ano passado."""
    verificar_escopo(db, usuario, no_id)
    comparacao = comparacao_yoy(db, empresa_id, no_id, produto_id, ano, mes_inicio, mes_fim)
    return ComparacaoYoYRead(
        atual=JanelaIndicadorRead(
            meta=comparacao.atual.meta,
            realizado=comparacao.atual.realizado,
            percentual=comparacao.atual.percentual,
            tem_dado=comparacao.atual.tem_dado,
        ),
        anterior=JanelaIndicadorRead(
            meta=comparacao.anterior.meta,
            realizado=comparacao.anterior.realizado,
            percentual=comparacao.anterior.percentual,
            tem_dado=comparacao.anterior.tem_dado,
        ),
    )


@router.get("/alertas-gap/{competencia_id}", response_model=list[ViolacaoPisoRead])
def alertas_gap(
    competencia_id: uuid.UUID, db: Session = Depends(get_db), _: Usuario = Depends(require_admin)
) -> list[ViolacaoPisoRead]:
    """Mesma checagem de piso usada para bloquear a publicação da competência
    (Etapa 2), exposta aqui como leitura para o painel de alertas."""
    violacoes = verificar_piso_competencia(db, competencia_id)
    return [
        ViolacaoPisoRead(
            estrutura_no_id=v.estrutura_no_id,
            produto_id=v.produto_id,
            tipo_medida=v.tipo_medida,
            meta_pai=v.meta_pai,
            soma_filhos=v.soma_filhos,
            gap=v.gap,
        )
        for v in violacoes
    ]
