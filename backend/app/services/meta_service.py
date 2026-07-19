from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models import Meta, Produto, Periodo, Vendedor
from app.schemas.metas import (
    ReplicarMetasRequest,
    ReplicarMetasResponse,
    ConflitoDeMeta
)
from typing import Tuple
import logging

logger = logging.getLogger(__name__)


def replicar_metas(
    db: Session,
    request: ReplicarMetasRequest,
    usuario_id: int,
    usuario_perfil: str
) -> Tuple[ReplicarMetasResponse, int]:
    """
    Replica metas de um período para múltiplos períodos.
    """
    
    # 1. Validar período de origem
    periodo_origem = db.get(Periodo, request.periodo_origem_id)
    
    if not periodo_origem:
        return ReplicarMetasResponse(
            status="erro",
            mensagem=f"Período origem ID {request.periodo_origem_id} não encontrado",
            metas_criadas=0,
            total_processadas=0
        ), 404
    
    # 2. Validar todos os períodos destino existem
    periodos_destino = db.query(Periodo).filter(
        Periodo.id.in_(request.periodos_destino_ids)
    ).all()
    
    if len(periodos_destino) != len(request.periodos_destino_ids):
        return ReplicarMetasResponse(
            status="erro",
            mensagem="Um ou mais períodos destino não encontrados",
            metas_criadas=0,
            total_processadas=0
        ), 404
    
    # 3. Buscar metas de origem
    metas_origem = db.query(Meta).filter(
        Meta.vendedor_id == request.vendedor_id,
        Meta.periodo_id == request.periodo_origem_id,
        Meta.ativo.is_(True)
    ).all()
    
    if not metas_origem:
        return ReplicarMetasResponse(
            status="aviso",
            mensagem="Nenhuma meta ativa encontrada no período de origem",
            metas_criadas=0,
            total_processadas=0
        ), 200
    
    # 4. Detectar conflitos
    conflitos: list[ConflitoDeMeta] = []
    metas_criadas = 0
    metas_atualizadas = 0
    
    for periodo_destino in periodos_destino:
        for meta_origem in metas_origem:
            # Buscar se já existe meta neste período
            meta_existente = db.query(Meta).filter(
                Meta.vendedor_id == request.vendedor_id,
                Meta.periodo_id == periodo_destino.id,
                Meta.produto_id == meta_origem.produto_id,
                Meta.ativo.is_(True)
            ).first()
            
            if meta_existente and not request.sobrescrever_conflitos:
                # Registrar conflito
                produto = db.get(Produto, meta_origem.produto_id)
                
                conflito = ConflitoDeMeta(
                    produto_id=meta_origem.produto_id,
                    produto_nome=produto.nome if produto else "Desconhecido",
                    periodo_id=periodo_destino.id,
                    periodo_ano=periodo_destino.ano,
                    periodo_mes=periodo_destino.mes,
                    valor_atual=meta_existente.valor,
                    valor_novo=meta_origem.valor
                )
                conflitos.append(conflito)
            
            elif meta_existente and request.sobrescrever_conflitos:
                # Sobrescrever
                meta_existente.valor = meta_origem.valor
                metas_atualizadas += 1
                logger.info(f"Meta atualizada: vendedor={request.vendedor_id}, periodo={periodo_destino.id}")
            
            else:
                # Criar nova meta
                nova_meta = Meta(
                    vendedor_id=request.vendedor_id,
                    periodo_id=periodo_destino.id,
                    produto_id=meta_origem.produto_id,
                    valor=meta_origem.valor,
                    empresa_id=meta_origem.empresa_id,
                    unidade_id=meta_origem.unidade_id,
                    gerente_id=meta_origem.gerente_id
                )
                db.add(nova_meta)
                metas_criadas += 1
                logger.info(f"Meta criada: vendedor={request.vendedor_id}, periodo={periodo_destino.id}")
    
    # 5. Se há conflitos e não é sobrescrita, retornar 202 com detalhes
    if conflitos and not request.sobrescrever_conflitos:
        return ReplicarMetasResponse(
            status="conflitos_detectados",
            mensagem=f"{len(conflitos)} conflitos encontrados. Resolva-os para continuar.",
            metas_criadas=metas_criadas,
            total_processadas=len(request.periodos_destino_ids) * len(metas_origem),
            conflitos=conflitos
        ), 202
    
    # 6. Commit e retornar sucesso
    db.commit()
    
    return ReplicarMetasResponse(
        status="sucesso",
        mensagem=f"Metas replicadas com sucesso. {metas_criadas} criadas, {metas_atualizadas} atualizadas.",
        metas_criadas=metas_criadas,
        metas_atualizadas=metas_atualizadas,
        total_processadas=len(request.periodos_destino_ids) * len(metas_origem)
    ), 200
