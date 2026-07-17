from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.scoping import verificar_escopo
from app.models.competencia import Competencia
from app.models.enums import StatusCompetencia, StatusMeta
from app.models.meta import Meta, MetaHistorico
from app.models.usuario import Usuario
from app.schemas.meta import MetaCreate, MetaHistoricoRead, MetaRead, MetaUpdate, PublicarMetaResponse
from app.services.auditoria import registrar as registrar_auditoria
from app.services.piso import verificar_piso_meta

router = APIRouter(prefix="/metas", tags=["metas"])


def _get_competencia_ou_404(db: Session, competencia_id: uuid.UUID) -> Competencia:
    competencia = db.get(Competencia, competencia_id)
    if competencia is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Competência não encontrada")
    return competencia


@router.get("", response_model=MetaRead)
def buscar_meta(
    competencia_id: uuid.UUID = Query(...),
    estrutura_no_id: uuid.UUID = Query(...),
    produto_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> Meta:
    verificar_escopo(db, usuario, estrutura_no_id)
    meta = (
        db.query(Meta)
        .filter(
            Meta.competencia_id == competencia_id,
            Meta.estrutura_no_id == estrutura_no_id,
            Meta.produto_id == produto_id,
        )
        .first()
    )
    if meta is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Nenhuma meta cadastrada para esses filtros"
        )
    return meta


@router.post("", response_model=MetaRead, status_code=status.HTTP_201_CREATED)
def criar_meta(
    payload: MetaCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)
) -> Meta:
    verificar_escopo(db, usuario, payload.estrutura_no_id)
    competencia = _get_competencia_ou_404(db, payload.competencia_id)
    if competencia.status == StatusCompetencia.FECHADA:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Competência fechada — somente leitura")

    existente = (
        db.query(Meta)
        .filter(
            Meta.competencia_id == payload.competencia_id,
            Meta.estrutura_no_id == payload.estrutura_no_id,
            Meta.produto_id == payload.produto_id,
        )
        .first()
    )
    if existente is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Já existe meta para esta competência/nó/produto"
        )

    meta = Meta(
        competencia_id=payload.competencia_id,
        estrutura_no_id=payload.estrutura_no_id,
        produto_id=payload.produto_id,
        tipo_medida=payload.tipo_medida,
        valor_meta=payload.valor_meta,
        status=StatusMeta.RASCUNHO,
    )
    db.add(meta)
    db.flush()
    db.add(
        MetaHistorico(
            meta_id=meta.id,
            valor_anterior=None,
            valor_novo=meta.valor_meta,
            usuario_id=usuario.id,
            motivo="Criação",
        )
    )
    db.commit()
    db.refresh(meta)
    return meta


@router.get("/publicadas", response_model=list[MetaRead])
def listar_metas_publicadas(
    competencia_id: uuid.UUID = Query(...),
    estrutura_no_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> list[Meta]:
    """Metas já PUBLICADAS de um nó nesta competência — usado para filtrar
    quais produtos podem receber lançamento de venda."""
    verificar_escopo(db, usuario, estrutura_no_id)
    return (
        db.query(Meta)
        .filter(
            Meta.competencia_id == competencia_id,
            Meta.estrutura_no_id == estrutura_no_id,
            Meta.status == StatusMeta.PUBLICADA,
        )
        .all()
    )


@router.get("/{meta_id}", response_model=MetaRead)
def obter_meta(
    meta_id: uuid.UUID, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)
) -> Meta:
    meta = db.get(Meta, meta_id)
    if meta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meta não encontrada")
    verificar_escopo(db, usuario, meta.estrutura_no_id)
    return meta


@router.get("/{meta_id}/historico", response_model=list[MetaHistoricoRead])
def historico_meta(
    meta_id: uuid.UUID, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)
) -> list[MetaHistoricoRead]:
    meta = db.get(Meta, meta_id)
    if meta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meta não encontrada")
    verificar_escopo(db, usuario, meta.estrutura_no_id)
    linhas = (
        db.query(MetaHistorico)
        .filter(MetaHistorico.meta_id == meta_id)
        .order_by(MetaHistorico.alterado_em)
        .all()
    )
    nomes = {
        u.id: u.nome
        for u in db.query(Usuario).filter(Usuario.id.in_({linha.usuario_id for linha in linhas})).all()
    }
    return [
        MetaHistoricoRead(
            id=linha.id,
            meta_id=linha.meta_id,
            valor_anterior=linha.valor_anterior,
            valor_novo=linha.valor_novo,
            usuario_id=linha.usuario_id,
            usuario_nome=nomes.get(linha.usuario_id, "?"),
            acao="Criação" if linha.valor_anterior is None else "Alteração",
            alterado_em=linha.alterado_em,
            motivo=linha.motivo,
        )
        for linha in linhas
    ]


@router.put("/{meta_id}", response_model=MetaRead)
def atualizar_meta(
    meta_id: uuid.UUID,
    payload: MetaUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> Meta:
    meta = db.get(Meta, meta_id)
    if meta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meta não encontrada")
    verificar_escopo(db, usuario, meta.estrutura_no_id)

    competencia = _get_competencia_ou_404(db, meta.competencia_id)
    if competencia.status == StatusCompetencia.FECHADA:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Competência fechada — somente leitura")

    valor_anterior = meta.valor_meta
    meta.valor_meta = payload.valor_meta
    db.add(
        MetaHistorico(
            meta_id=meta.id,
            valor_anterior=valor_anterior,
            valor_novo=payload.valor_meta,
            usuario_id=usuario.id,
            motivo=payload.motivo,
        )
    )
    registrar_auditoria(
        db,
        entidade="meta",
        entidade_id=meta.id,
        acao="ALTEROU",
        usuario_id=usuario.id,
        dados_antes={"valor_meta": str(valor_anterior)},
        dados_depois={"valor_meta": str(payload.valor_meta)},
    )
    db.commit()
    db.refresh(meta)
    return meta


@router.delete("/{meta_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def excluir_meta(
    meta_id: uuid.UUID, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)
) -> None:
    meta = db.get(Meta, meta_id)
    if meta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meta não encontrada")
    verificar_escopo(db, usuario, meta.estrutura_no_id)

    competencia = _get_competencia_ou_404(db, meta.competencia_id)
    if competencia.status == StatusCompetencia.FECHADA:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Competência fechada — somente leitura")
    if meta.status == StatusMeta.PUBLICADA:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Meta publicada não pode ser excluída"
        )

    registrar_auditoria(
        db,
        entidade="meta",
        entidade_id=meta.id,
        acao="EXCLUIU",
        usuario_id=usuario.id,
        dados_antes={
            "competencia_id": str(meta.competencia_id),
            "estrutura_no_id": str(meta.estrutura_no_id),
            "produto_id": str(meta.produto_id),
            "valor_meta": str(meta.valor_meta),
            "status": meta.status.value,
        },
    )
    db.query(MetaHistorico).filter(MetaHistorico.meta_id == meta.id).delete()
    db.delete(meta)
    db.commit()


@router.post("/{meta_id}/publicar", response_model=PublicarMetaResponse)
def publicar_meta(
    meta_id: uuid.UUID, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)
) -> PublicarMetaResponse:
    meta = db.get(Meta, meta_id)
    if meta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meta não encontrada")
    verificar_escopo(db, usuario, meta.estrutura_no_id)

    competencia = _get_competencia_ou_404(db, meta.competencia_id)
    if competencia.status == StatusCompetencia.FECHADA:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Competência fechada — somente leitura")

    if meta.status == StatusMeta.PUBLICADA:
        return PublicarMetaResponse(publicada=True)

    violacao = verificar_piso_meta(db, meta)
    if violacao is not None:
        return PublicarMetaResponse(publicada=False, gap=violacao.gap, soma_filhos=violacao.soma_filhos)

    meta.status = StatusMeta.PUBLICADA
    db.commit()
    return PublicarMetaResponse(publicada=True)
