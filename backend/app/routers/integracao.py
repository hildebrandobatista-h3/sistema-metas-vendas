"""Endpoints para gerenciar integrações com sistemas externos (NectarCRM, etc).

Apenas admin pode criar/editar. Qualquer usuário logado pode listar.
"""
import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import usuario_atual, so_admin
from ..models import ParamIntegracao, Usuario
from ..schemas.integracao import (
    ParamIntegracaoCreate, ParamIntegracaoOut, ParamIntegracaoUpdate,
    TestarConexaoRequest, TestarConexaoResponse
)

router = APIRouter(tags=["integracao"], prefix="/integracao")


@router.get("/params", response_model=list[ParamIntegracaoOut])
def listar_params(_: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    """Lista todas as integrações configuradas (sem expor tokens)."""
    stmt = select(ParamIntegracao).where(ParamIntegracao.ativo.is_(True))
    return db.scalars(stmt).all()


@router.get("/params/{id_}", response_model=ParamIntegracaoOut)
def obter_param(id_: int, _: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    """Obtém detalhes de uma integração (sem expor token)."""
    obj = db.get(ParamIntegracao, id_)
    if obj is None:
        raise HTTPException(404, "Integração não encontrada")
    return obj


@router.post("/params", response_model=ParamIntegracaoOut, status_code=201)
def criar_param(payload: ParamIntegracaoCreate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    """Cria uma nova integração (apenas admin)."""
    # Verificar se já existe integração do mesmo tipo
    stmt = select(ParamIntegracao).where(ParamIntegracao.tipo_integracao == payload.tipo_integracao)
    existente = db.scalars(stmt).first()
    if existente:
        raise HTTPException(409, f"Já existe integração configurada para {payload.tipo_integracao}")
    
    obj = ParamIntegracao(
        tipo_integracao=payload.tipo_integracao,
        token=payload.token,
        endpoint_base=payload.endpoint_base,
        ativo=payload.ativo
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/params/{id_}", response_model=ParamIntegracaoOut)
def editar_param(id_: int, payload: ParamIntegracaoUpdate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    """Edita uma integração (apenas admin)."""
    obj = db.get(ParamIntegracao, id_)
    if obj is None:
        raise HTTPException(404, "Integração não encontrada")
    
    if payload.token is not None:
        obj.token = payload.token
    if payload.endpoint_base is not None:
        obj.endpoint_base = payload.endpoint_base
    if payload.ativo is not None:
        obj.ativo = payload.ativo
    
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/params/{id_}", status_code=204)
def inativar_param(id_: int, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    """Inativa uma integração (soft delete)."""
    obj = db.get(ParamIntegracao, id_)
    if obj is None:
        raise HTTPException(404, "Integração não encontrada")
    obj.ativo = False
    db.commit()


@router.post("/params/testar-conexao", response_model=TestarConexaoResponse)
async def testar_conexao(payload: TestarConexaoRequest, _: Usuario = Depends(usuario_atual)):
    """Testa conexão com a API externa (NectarCRM, etc)."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            if payload.tipo_integracao == "nectar_crm":
                # Teste com endpoint de oportunidades
                url = f"{payload.endpoint_base}/oportunidades/?api_token={payload.token}"
                response = await client.get(url)
                
                if response.status_code == 200:
                    data = response.json()
                    return TestarConexaoResponse(
                        sucesso=True,
                        mensagem="Conexão bem-sucedida com NectarCRM",
                        dados_amostra={"total_oportunidades": len(data) if isinstance(data, list) else 0}
                    )
                elif response.status_code == 401:
                    return TestarConexaoResponse(
                        sucesso=False,
                        mensagem="Token inválido ou expirado"
                    )
                else:
                    return TestarConexaoResponse(
                        sucesso=False,
                        mensagem=f"Erro da API: HTTP {response.status_code}"
                    )
            else:
                return TestarConexaoResponse(
                    sucesso=False,
                    mensagem=f"Tipo de integração '{payload.tipo_integracao}' não suportado"
                )
    
    except httpx.TimeoutException:
        return TestarConexaoResponse(
            sucesso=False,
            mensagem="Timeout ao conectar à API (timeout de 10s)"
        )
    except httpx.ConnectError as e:
        return TestarConexaoResponse(
            sucesso=False,
            mensagem=f"Erro de conexão: {str(e)}"
        )
    except Exception as e:
        return TestarConexaoResponse(
            sucesso=False,
            mensagem=f"Erro inesperado: {str(e)}"
        )
