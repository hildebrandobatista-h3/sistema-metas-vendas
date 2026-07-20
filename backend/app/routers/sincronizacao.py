"""Endpoints para sincronizar oportunidades ganhas do NectarCRM com a tabela intermediária."""
import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import usuario_atual, so_admin
from ..models import ParamIntegracao, OportunidadeNectar, Usuario
from ..schemas.integracao import TestarConexaoResponse

router = APIRouter(tags=["sincronizacao"], prefix="/sincronizacao")


@router.get("/oportunidades")
def listar_oportunidades_sincronizadas(
    status: str | None = None,
    _: Usuario = Depends(usuario_atual),
    db: Session = Depends(get_db)
):
    """Lista oportunidades sincronizadas do NectarCRM."""
    stmt = select(OportunidadeNectar).order_by(OportunidadeNectar.data_sincronizacao.desc())
    
    if status:
        stmt = stmt.where(OportunidadeNectar.status_sincronizacao == status)
    
    return db.scalars(stmt).all()


@router.post("/sincronizar")
async def sincronizar_oportunidades(
    background_tasks: BackgroundTasks,
    _: Usuario = Depends(so_admin),
    db: Session = Depends(get_db)
):
    """Sincroniza oportunidades ganhas do NectarCRM (executa em background)."""
    # Buscar param de integração do NectarCRM
    stmt = select(ParamIntegracao).where(
        ParamIntegracao.tipo_integracao == "nectar_crm",
        ParamIntegracao.ativo.is_(True)
    )
    param = db.scalars(stmt).first()
    
    if not param:
        raise HTTPException(404, "Nenhuma integração do NectarCRM configurada")
    
    # Executar sincronização em background
    background_tasks.add_task(_sincronizar_nectar, param.id, db)
    
    return {"mensagem": "Sincronização iniciada em background"}


async def _sincronizar_nectar(param_id: int, db: Session):
    """Task de background para sincronizar oportunidades."""
    try:
        # Recarregar param do DB
        param = db.get(ParamIntegracao, param_id)
        if not param:
            return
        
        # Buscar oportunidades do NectarCRM
        async with httpx.AsyncClient(timeout=30) as client:
            url = f"{param.endpoint_base}/oportunidades/?api_token={param.token}"
            response = await client.get(url)
            
            if response.status_code != 200:
                param.status_ultimo_teste = "erro"
                param.ultima_sincronizacao = datetime.now(timezone.utc)
                db.commit()
                return
            
            oportunidades = response.json()
            if not isinstance(oportunidades, list):
                oportunidades = []
            
            # Filtrar oportunidades ganhas (buscar por campo "status" ou "ganho")
            oportunidades_ganhas = [
                o for o in oportunidades
                if o.get("status") == "Ganho" or o.get("ganho") or o.get("data_conclusao")
            ]
            
            # Sincronizar cada oportunidade
            for opp in oportunidades_ganhas:
                # Verificar se já existe
                stmt = select(OportunidadeNectar).where(
                    OportunidadeNectar.param_integracao_id == param.id,
                    OportunidadeNectar.id_oportunidade_ext == opp.get("id")
                )
                existing = db.scalars(stmt).first()
                
                if not existing:
                    # Extrair cliente
                    cliente_data = opp.get("cliente", {})
                    cliente_nome = cliente_data.get("nome") if isinstance(cliente_data, dict) else str(cliente_data)
                    
                    new_opp = OportunidadeNectar(
                        param_integracao_id=param.id,
                        id_oportunidade_ext=opp.get("id"),
                        nome=opp.get("nome", ""),
                        cliente=cliente_nome,
                        valor=float(opp.get("valor", 0)) if opp.get("valor") else None,
                        status_sincronizacao="pendente",
                        data_sincronizacao=datetime.now(timezone.utc)
                    )
                    db.add(new_opp)
            
            # Atualizar status do param
            param.status_ultimo_teste = "sucesso"
            param.ultima_sincronizacao = datetime.now(timezone.utc)
            db.commit()
    
    except Exception as e:
        if db.is_active:
            param = db.get(ParamIntegracao, param_id)
            if param:
                param.status_ultimo_teste = "erro"
                param.ultima_sincronizacao = datetime.now(timezone.utc)
                db.commit()


@router.post("/oportunidades/{id_}/mapear")
def mapear_oportunidade(
    id_: int,
    payload: dict,
    _: Usuario = Depends(so_admin),
    db: Session = Depends(get_db)
):
    """Mapeia uma oportunidade para um realizado existente."""
    opp = db.get(OportunidadeNectar, id_)
    if not opp:
        raise HTTPException(404, "Oportunidade não encontrada")
    
    # Atualizar status
    opp.status_sincronizacao = "mapeado"
    opp.data_sincronizacao = datetime.now(timezone.utc)
    db.commit()
    db.refresh(opp)
    
    return opp


@router.delete("/oportunidades/{id_}")
def ignorar_oportunidade(
    id_: int,
    _: Usuario = Depends(so_admin),
    db: Session = Depends(get_db)
):
    """Marca uma oportunidade como ignorada (não será sincronizada)."""
    opp = db.get(OportunidadeNectar, id_)
    if not opp:
        raise HTTPException(404, "Oportunidade não encontrada")
    
    opp.status_sincronizacao = "ignorado"
    db.commit()
