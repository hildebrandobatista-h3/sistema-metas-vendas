from __future__ import annotations

import calendar
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.core.scoping import verificar_escopo
from app.models.competencia import Competencia
from app.models.enums import AcaoVendaHistorico, OrigemVenda, StatusCompetencia, StatusMeta
from app.models.meta import Meta
from app.models.usuario import Usuario
from app.models.venda import Venda, VendaHistorico
from app.schemas.venda import VendaCreate, VendaHistoricoRead, VendaRead, VendaUpdate
from app.services.auditoria import registrar as registrar_auditoria

router = APIRouter(prefix="/vendas", tags=["vendas"])


def _get_competencia_ou_404(db: Session, competencia_id: uuid.UUID) -> Competencia:
    competencia = db.get(Competencia, competencia_id)
    if competencia is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Competência não encontrada")
    return competencia


def _get_venda_ou_404(db: Session, venda_id: uuid.UUID) -> Venda:
    venda = db.get(Venda, venda_id)
    if venda is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venda não encontrada")
    return venda


@router.post("", response_model=VendaRead, status_code=status.HTTP_201_CREATED)
def lancar_venda(
    payload: VendaCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)
) -> Venda:
    verificar_escopo(db, usuario, payload.vendedor_no_id)

    competencia = _get_competencia_ou_404(db, payload.competencia_id)
    if competencia.status != StatusCompetencia.PUBLICADA:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Só é possível lançar venda em competência PUBLICADA (status atual: {competencia.status.value})",
        )

    ultimo_dia = calendar.monthrange(competencia.ano, competencia.mes)[1]
    if not (
        payload.data_venda.year == competencia.ano
        and payload.data_venda.month == competencia.mes
        and 1 <= payload.data_venda.day <= ultimo_dia
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"data_venda precisa estar dentro de {competencia.mes:02d}/{competencia.ano}",
        )

    meta = (
        db.query(Meta)
        .filter(
            Meta.competencia_id == payload.competencia_id,
            Meta.estrutura_no_id == payload.vendedor_no_id,
            Meta.produto_id == payload.produto_id,
        )
        .first()
    )
    if meta is None or meta.status != StatusMeta.PUBLICADA:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Só é possível lançar venda em produto/nó com meta PUBLICADA nesta competência",
        )

    if db.query(Venda).filter(Venda.numero_venda == payload.numero_venda).first() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Número de venda já utilizado")

    venda = Venda(
        competencia_id=payload.competencia_id,
        vendedor_no_id=payload.vendedor_no_id,
        produto_id=payload.produto_id,
        numero_venda=payload.numero_venda,
        cliente_nome=payload.cliente_nome,
        data_venda=payload.data_venda,
        tipo_medida=meta.tipo_medida,
        valor_lancado=payload.valor_lancado,
        origem=OrigemVenda.MANUAL,
        lancado_por=usuario.id,
    )
    db.add(venda)
    db.commit()
    db.refresh(venda)
    return venda


@router.get("", response_model=list[VendaRead])
def listar_vendas(
    competencia_id: uuid.UUID = Query(...),
    vendedor_no_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> list[Venda]:
    verificar_escopo(db, usuario, vendedor_no_id)
    return (
        db.query(Venda)
        .filter(Venda.competencia_id == competencia_id, Venda.vendedor_no_id == vendedor_no_id)
        .order_by(Venda.data_venda.desc())
        .all()
    )


@router.get("/{venda_id}", response_model=VendaRead)
def obter_venda(
    venda_id: uuid.UUID, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)
) -> Venda:
    venda = _get_venda_ou_404(db, venda_id)
    verificar_escopo(db, usuario, venda.vendedor_no_id)
    return venda


@router.put("/{venda_id}", response_model=VendaRead)
def editar_venda(
    venda_id: uuid.UUID,
    payload: VendaUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(require_admin),
) -> Venda:
    venda = _get_venda_ou_404(db, venda_id)
    competencia = _get_competencia_ou_404(db, venda.competencia_id)
    if competencia.status == StatusCompetencia.FECHADA:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Competência fechada — somente leitura (reabra para editar)"
        )

    valor_anterior = venda.valor_lancado
    venda.valor_lancado = payload.valor_lancado
    db.add(
        VendaHistorico(
            venda_id=venda.id,
            valor_anterior=valor_anterior,
            usuario_id=usuario.id,
            acao=AcaoVendaHistorico.EDICAO,
        )
    )
    registrar_auditoria(
        db,
        entidade="venda",
        entidade_id=venda.id,
        acao="EDICAO",
        usuario_id=usuario.id,
        dados_antes={"valor_lancado": str(valor_anterior)},
        dados_depois={"valor_lancado": str(payload.valor_lancado)},
    )
    db.commit()
    db.refresh(venda)
    return venda


@router.delete("/{venda_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def excluir_venda(
    venda_id: uuid.UUID, db: Session = Depends(get_db), usuario: Usuario = Depends(require_admin)
) -> None:
    venda = _get_venda_ou_404(db, venda_id)
    competencia = _get_competencia_ou_404(db, venda.competencia_id)
    if competencia.status == StatusCompetencia.FECHADA:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Competência fechada — somente leitura (reabra para excluir)"
        )

    db.add(
        VendaHistorico(
            venda_id=venda.id,
            valor_anterior=venda.valor_lancado,
            usuario_id=usuario.id,
            acao=AcaoVendaHistorico.EXCLUSAO,
        )
    )
    registrar_auditoria(
        db,
        entidade="venda",
        entidade_id=venda.id,
        acao="EXCLUSAO",
        usuario_id=usuario.id,
        dados_antes={
            "numero_venda": venda.numero_venda,
            "valor_lancado": str(venda.valor_lancado),
        },
        dados_depois=None,
    )
    db.delete(venda)
    db.commit()


@router.get("/{venda_id}/historico", response_model=list[VendaHistoricoRead])
def historico_venda(
    venda_id: uuid.UUID, db: Session = Depends(get_db), _: Usuario = Depends(require_admin)
) -> list[VendaHistorico]:
    return (
        db.query(VendaHistorico)
        .filter(VendaHistorico.venda_id == venda_id)
        .order_by(VendaHistorico.alterado_em)
        .all()
    )
