from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.competencia import Competencia
from app.models.enums import AcaoFechamento, StatusCompetencia
from app.models.fechamento_evento import FechamentoEvento
from app.models.usuario import Usuario
from app.schemas.competencia import (
    CompetenciaCreate,
    CompetenciaRead,
    FechamentoEventoRead,
    PublicarCompetenciaResponse,
    ReabrirCompetenciaRequest,
    ViolacaoPisoRead,
)
from app.services.auditoria import registrar as registrar_auditoria
from app.services.piso import verificar_piso_competencia

router = APIRouter(prefix="/competencias", tags=["competencias"])


def _get_competencia_ou_404(db: Session, competencia_id: uuid.UUID) -> Competencia:
    competencia = db.get(Competencia, competencia_id)
    if competencia is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Competência não encontrada")
    return competencia


@router.post("", response_model=CompetenciaRead, status_code=status.HTTP_201_CREATED)
def criar_competencia(
    payload: CompetenciaCreate, db: Session = Depends(get_db), _: Usuario = Depends(require_admin)
) -> Competencia:
    if not 1 <= payload.mes <= 12:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="mes deve estar entre 1 e 12")

    existente = (
        db.query(Competencia)
        .filter(
            Competencia.empresa_id == payload.empresa_id,
            Competencia.ano == payload.ano,
            Competencia.mes == payload.mes,
        )
        .first()
    )
    if existente is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Já existe competência para este ano/mês")

    competencia = Competencia(
        empresa_id=payload.empresa_id, ano=payload.ano, mes=payload.mes, status=StatusCompetencia.ABERTA
    )
    db.add(competencia)
    db.commit()
    db.refresh(competencia)
    return competencia


@router.get("", response_model=list[CompetenciaRead])
def listar_competencias(
    empresa_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
) -> list[Competencia]:
    return (
        db.query(Competencia)
        .filter(Competencia.empresa_id == empresa_id)
        .order_by(Competencia.ano.desc(), Competencia.mes.desc())
        .all()
    )


@router.get("/{competencia_id}", response_model=CompetenciaRead)
def obter_competencia(competencia_id: uuid.UUID, db: Session = Depends(get_db)) -> Competencia:
    return _get_competencia_ou_404(db, competencia_id)


@router.post("/{competencia_id}/publicar", response_model=PublicarCompetenciaResponse)
def publicar_competencia(
    competencia_id: uuid.UUID, db: Session = Depends(get_db), _: Usuario = Depends(require_admin)
) -> PublicarCompetenciaResponse:
    competencia = _get_competencia_ou_404(db, competencia_id)
    if competencia.status != StatusCompetencia.ABERTA:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Só é possível publicar competência ABERTA (status atual: {competencia.status.value})",
        )

    violacoes = verificar_piso_competencia(db, competencia_id)
    if violacoes:
        return PublicarCompetenciaResponse(
            publicada=False,
            violacoes=[
                ViolacaoPisoRead(
                    estrutura_no_id=v.estrutura_no_id,
                    produto_id=v.produto_id,
                    tipo_medida=v.tipo_medida,
                    meta_pai=v.meta_pai,
                    soma_filhos=v.soma_filhos,
                    gap=v.gap,
                )
                for v in violacoes
            ],
        )

    competencia.status = StatusCompetencia.PUBLICADA
    db.commit()
    return PublicarCompetenciaResponse(publicada=True, violacoes=[])


@router.post("/{competencia_id}/fechar", response_model=CompetenciaRead)
def fechar_competencia(
    competencia_id: uuid.UUID, db: Session = Depends(get_db), usuario: Usuario = Depends(require_admin)
) -> Competencia:
    competencia = _get_competencia_ou_404(db, competencia_id)
    if competencia.status != StatusCompetencia.PUBLICADA:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Só é possível fechar competência PUBLICADA (status atual: {competencia.status.value})",
        )

    competencia.status = StatusCompetencia.FECHADA
    competencia.fechada_em = datetime.now(timezone.utc)
    db.add(
        FechamentoEvento(
            competencia_id=competencia.id, acao=AcaoFechamento.FECHOU, usuario_id=usuario.id, observacao=None
        )
    )
    registrar_auditoria(
        db,
        entidade="competencia",
        entidade_id=competencia.id,
        acao="FECHOU",
        usuario_id=usuario.id,
        dados_antes={"status": "PUBLICADA"},
        dados_depois={"status": "FECHADA"},
    )
    db.commit()
    db.refresh(competencia)
    return competencia


@router.post("/{competencia_id}/reabrir", response_model=CompetenciaRead)
def reabrir_competencia(
    competencia_id: uuid.UUID,
    payload: ReabrirCompetenciaRequest,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_admin),
) -> Competencia:
    competencia = _get_competencia_ou_404(db, competencia_id)
    if competencia.status != StatusCompetencia.FECHADA:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Só é possível reabrir competência FECHADA (status atual: {competencia.status.value})",
        )

    # Reabre para PUBLICADA (não para ABERTA): o propósito da reabertura é
    # justamente voltar a permitir lançamento de venda, que só é possível
    # com a competência PUBLICADA.
    competencia.status = StatusCompetencia.PUBLICADA
    competencia.reaberta_em = datetime.now(timezone.utc)
    db.add(
        FechamentoEvento(
            competencia_id=competencia.id,
            acao=AcaoFechamento.REABRIU,
            usuario_id=usuario.id,
            observacao=payload.motivo,
        )
    )
    registrar_auditoria(
        db,
        entidade="competencia",
        entidade_id=competencia.id,
        acao="REABRIU",
        usuario_id=usuario.id,
        dados_antes={"status": "FECHADA"},
        dados_depois={"status": "PUBLICADA", "motivo": payload.motivo},
    )
    db.commit()
    db.refresh(competencia)
    return competencia


@router.get("/{competencia_id}/eventos", response_model=list[FechamentoEventoRead])
def eventos_competencia(
    competencia_id: uuid.UUID, db: Session = Depends(get_db), _: Usuario = Depends(require_admin)
) -> list[FechamentoEvento]:
    return (
        db.query(FechamentoEvento)
        .filter(FechamentoEvento.competencia_id == competencia_id)
        .order_by(FechamentoEvento.executado_em)
        .all()
    )
