"""Endpoints de Realizado (lançamentos de vendas)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime

from ..db import get_db
from ..deps import usuario_atual
from ..models import Realizado, Vendedor, Produto
from ..schemas.movimento import RealizadoCreate, RealizadoUpdate, RealizadoResponse

router = APIRouter(prefix="/realizados", tags=["realizados"])


@router.get("/", response_model=list[RealizadoResponse])
def listar_realizados(
    vendedor_id: int,
    periodo_id: int | None = None,
    db: Session = Depends(get_db),
    current_user = Depends(usuario_atual)
):
    """Retorna realizados do vendedor com filtros opcionais."""
    try:
        # Validar permissões
        if current_user.perfil == "vendedor":
            if current_user.vendedor_id != vendedor_id:
                raise HTTPException(status_code=403, detail="Sem permissão")

        query = select(Realizado).where(
            Realizado.vendedor_id == vendedor_id,
            Realizado.ativo == True
        )

        if periodo_id:
            query = query.where(Realizado.periodo_id == periodo_id)

        realizados = db.scalars(query.order_by(Realizado.data_venda.desc())).all()
        return realizados

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict)
def criar_realizado(
    realizado: RealizadoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(usuario_atual)
):
    """Cria novo lançamento de realizado."""
    try:
        # Validar permissões
        if current_user.perfil == "vendedor":
            if current_user.vendedor_id != realizado.vendedor_id:
                raise HTTPException(status_code=403, detail="Sem permissão")

        # Validar se vendedor existe
        vendedor = db.get(Vendedor, realizado.vendedor_id)
        if not vendedor:
            raise HTTPException(status_code=404, detail="Vendedor não encontrado")

        # Validar se produto existe
        produto = db.get(Produto, realizado.produto_id)
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        # Criar realizado
        novo_realizado = Realizado(
            vendedor_id=realizado.vendedor_id,
            produto_id=realizado.produto_id,
            empresa_id=realizado.empresa_id,
            unidade_id=realizado.unidade_id,
            gerente_id=realizado.gerente_id,
            periodo_id=realizado.periodo_id,
            data_venda=realizado.data_venda,
            valor=realizado.valor,
            numero_oportunidade=realizado.numero_oportunidade,
            numero_proposta=realizado.numero_proposta,
            codigo_cliente=realizado.codigo_cliente,
            cnpj=realizado.cnpj,
            razao_social=realizado.razao_social,
            nome_fantasia=realizado.nome_fantasia,
            descricao=realizado.descricao,
            origem=realizado.origem,
            criado_por=current_user.id,
            atualizado_por=current_user.id
        )

        db.add(novo_realizado)
        db.commit()
        db.refresh(novo_realizado)

        return {
            "success": True,
            "message": "Realizado criado com sucesso",
            "realizado": RealizadoResponse.from_orm(novo_realizado)
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{realizado_id}", response_model=dict)
def atualizar_realizado(
    realizado_id: int,
    realizado: RealizadoUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(usuario_atual)
):
    """Atualiza um realizado existente."""
    try:
        db_realizado = db.get(Realizado, realizado_id)
        if not db_realizado:
            raise HTTPException(status_code=404, detail="Realizado não encontrado")

        # Validar permissões
        if current_user.perfil == "vendedor":
            if current_user.vendedor_id != db_realizado.vendedor_id:
                raise HTTPException(status_code=403, detail="Sem permissão")

        # Atualizar campos
        if realizado.valor is not None:
            db_realizado.valor = realizado.valor
        if realizado.descricao is not None:
            db_realizado.descricao = realizado.descricao
        if realizado.numero_oportunidade is not None:
            db_realizado.numero_oportunidade = realizado.numero_oportunidade
        if realizado.numero_proposta is not None:
            db_realizado.numero_proposta = realizado.numero_proposta
        if realizado.codigo_cliente is not None:
            db_realizado.codigo_cliente = realizado.codigo_cliente
        if realizado.cnpj is not None:
            db_realizado.cnpj = realizado.cnpj
        if realizado.razao_social is not None:
            db_realizado.razao_social = realizado.razao_social
        if realizado.nome_fantasia is not None:
            db_realizado.nome_fantasia = realizado.nome_fantasia
        if realizado.data_venda is not None:
            db_realizado.data_venda = realizado.data_venda

        db_realizado.atualizado_por = current_user.id
        db_realizado.atualizado_em = datetime.utcnow()

        db.commit()
        db.refresh(db_realizado)

        return {
            "success": True,
            "message": "Realizado atualizado com sucesso",
            "realizado": RealizadoResponse.from_orm(db_realizado)
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{realizado_id}", response_model=dict)
def deletar_realizado(
    realizado_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(usuario_atual)
):
    """Deleta um realizado (soft delete)."""
    try:
        db_realizado = db.get(Realizado, realizado_id)
        if not db_realizado:
            raise HTTPException(status_code=404, detail="Realizado não encontrado")

        # Validar permissões
        if current_user.perfil == "vendedor":
            if current_user.vendedor_id != db_realizado.vendedor_id:
                raise HTTPException(status_code=403, detail="Sem permissão")

        # Soft delete
        db_realizado.ativo = False
        db_realizado.atualizado_por = current_user.id
        db_realizado.atualizado_em = datetime.utcnow()

        db.commit()

        return {
            "success": True,
            "message": "Realizado deletado com sucesso"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
