"""Serviço de replicação de metas"""
from sqlalchemy.orm import Session
from sqlalchemy import select
from decimal import Decimal
from datetime import datetime
from typing import Tuple

from ..models import Meta, Periodo, Produto, Vendedor
from ..schemas.metas import ReplicarMetasRequest, ReplicarMetasResponse, ConflitoDeMeta


def replicar_metas(
    db: Session,
    request: ReplicarMetasRequest
) -> Tuple[ReplicarMetasResponse, int]:
    """
    Replica metas de um período para múltiplos períodos.
    
    Retorna:
        (ReplicarMetasResponse, 200) se sucesso
        (ReplicarMetasResponse, 202) se conflitos detectados
        (ReplicarMetasResponse, 404) se período/vendedor não encontrado
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
    
    # 2. Validar vendedor
    vendedor = db.get(Vendedor, request.vendedor_id)
    if not vendedor:
        return ReplicarMetasResponse(
            status="erro",
            mensagem=f"Vendedor ID {request.vendedor_id} não encontrado",
            metas_criadas=0,
            total_processadas=0
        ), 404
    
    # 3. Validar todos os períodos destino existem
    periodos_destino = db.scalars(
        select(Periodo).where(Periodo.id.in_(request.periodos_destino_ids))
    ).all()
    
    if len(periodos_destino) != len(request.periodos_destino_ids):
        return ReplicarMetasResponse(
            status="erro",
            mensagem="Um ou mais períodos destino não encontrados",
            metas_criadas=0,
            total_processadas=0
        ), 404
    
    # 4. Buscar metas de origem
    metas_origem = db.scalars(
        select(Meta).where(
            Meta.vendedor_id == request.vendedor_id,
            Meta.periodo_id == request.periodo_origem_id
        )
    ).all()
    
    if not metas_origem:
        return ReplicarMetasResponse(
            status="aviso",
            mensagem="Nenhuma meta encontrada no período de origem",
            metas_criadas=0,
            total_processadas=0
        ), 200
    
    # 5. Detectar conflitos e replicar
    conflitos = []
    metas_criadas = 0
    metas_atualizadas = 0
    
    for periodo_destino in periodos_destino:
        for meta_origem in metas_origem:
            # Buscar se já existe meta neste período/produto
            meta_existente = db.scalar(
                select(Meta).where(
                    Meta.vendedor_id == request.vendedor_id,
                    Meta.periodo_id == periodo_destino.id,
                    Meta.produto_id == meta_origem.produto_id
                )
            )
            
            if meta_existente and not request.sobrescrever_conflitos:
                # Registrar conflito
                produto = db.get(Produto, meta_origem.produto_id)
                
                conflito = ConflitoDeMeta(
                    produto_id=meta_origem.produto_id,
                    produto_nome=produto.nome if produto else "Desconhecido",
                    periodo_id=periodo_destino.id,
                    periodo_ano=periodo_destino.ano,
                    periodo_mes=periodo_destino.mes,
                    valor_atual=float(meta_existente.valor),
                    valor_novo=float(meta_origem.valor)
                )
                conflitos.append(conflito)
            
            elif meta_existente and request.sobrescrever_conflitos:
                # Atualizar meta existente
                meta_existente.valor = meta_origem.valor
                meta_existente.atualizado_em = datetime.utcnow()
                metas_atualizadas += 1
            
            else:
                # Criar nova meta
                nova_meta = Meta(
                    vendedor_id=request.vendedor_id,
                    periodo_id=periodo_destino.id,
                    produto_id=meta_origem.produto_id,
                    valor=meta_origem.valor
                )
                db.add(nova_meta)
                metas_criadas += 1
    
    # 6. Se há conflitos e não é sobrescrita, retornar 202
    if conflitos and not request.sobrescrever_conflitos:
        return ReplicarMetasResponse(
            status="conflitos_detectados",
            mensagem=f"{len(conflitos)} conflitos encontrados",
            metas_criadas=metas_criadas,
            total_processadas=len(request.periodos_destino_ids) * len(metas_origem),
            conflitos=conflitos
        ), 202
    
    # 7. Commit e retornar sucesso
    db.commit()
    
    return ReplicarMetasResponse(
        status="sucesso",
        mensagem="Metas replicadas com sucesso",
        metas_criadas=metas_criadas,
        metas_atualizadas=metas_atualizadas,
        total_processadas=len(request.periodos_destino_ids) * len(metas_origem)
    ), 200
