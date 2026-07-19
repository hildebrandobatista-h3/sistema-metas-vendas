"""Endpoints de meta (protegidos).
Escrita: apenas admin. Leitura: admin tudo; gerente seus vendedores; vendedor o seu.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import usuario_atual, so_admin, vendedores_visiveis
from ..models import Meta, Produto, Periodo, Usuario
from ..schemas.metas import MetaLoteCreate, MetaUpdate, MetaOut
from ._helpers import resolver_hierarquia, get_or_create_periodo

router = APIRouter(tags=["metas"])


@router.post("/metas/lote", response_model=list[MetaOut], status_code=201)
def cadastrar_metas_lote(payload: MetaLoteCreate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    hier = resolver_hierarquia(db, payload.vendedor_id)
    per = get_or_create_periodo(db, payload.ano, payload.mes)
    for item in payload.itens:
        prod = db.get(Produto, item.produto_id)
        if prod is None or not prod.ativo:
            raise HTTPException(404, f"produto {item.produto_id} nao encontrado ou inativo")
    resultado = []
    for item in payload.itens:
        existente = db.scalar(select(Meta).where(
            Meta.vendedor_id == payload.vendedor_id,
            Meta.produto_id == item.produto_id,
            Meta.periodo_id == per.id))
        if existente is not None:
            existente.valor = item.valor
            existente.ativo = True
            resultado.append(existente)
        else:
            m = Meta(vendedor_id=payload.vendedor_id, produto_id=item.produto_id,
                     periodo_id=per.id, valor=item.valor,
                     **{k: hier[k] for k in ("empresa_id", "unidade_id", "gerente_id")})
            db.add(m)
            resultado.append(m)
    db.commit()
    for m in resultado:
        db.refresh(m)
    return resultado


@router.get("/metas", response_model=list[MetaOut])
def listar_metas(vendedor_id: int | None = None, ano: int | None = None, mes: int | None = None,
                 incluir_inativos: bool = False, u: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    stmt = select(Meta)
    vis = vendedores_visiveis(db, u)
    if vis is not None:
        if not vis:
            return []
        stmt = stmt.where(Meta.vendedor_id.in_(vis))
    if vendedor_id is not None:
        stmt = stmt.where(Meta.vendedor_id == vendedor_id)
    if ano is not None or mes is not None:
        stmt = stmt.join(Periodo, Meta.periodo_id == Periodo.id)
        if ano is not None:
            stmt = stmt.where(Periodo.ano == ano)
        if mes is not None:
            stmt = stmt.where(Periodo.mes == mes)
    if not incluir_inativos:
        stmt = stmt.where(Meta.ativo.is_(True))
    return db.scalars(stmt).all()


@router.patch("/metas/{id_}", response_model=MetaOut)
def atualizar_meta(id_: int, payload: MetaUpdate, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    m = db.get(Meta, id_)
    if m is None:
        raise HTTPException(404, "meta nao encontrada")
    m.valor = payload.valor
    db.commit()
    db.refresh(m)
    return m


@router.delete("/metas/{id_}", status_code=204)
def inativar_meta(id_: int, _: Usuario = Depends(so_admin), db: Session = Depends(get_db)):
    m = db.get(Meta, id_)
    if m is None:
        raise HTTPException(404, "meta nao encontrada")
    m.ativo = False
    db.commit()


# ============ REPLICAÇÃO DE METAS ============

from ..services import meta_service
from ..schemas.metas import ReplicarMetasRequest, ReplicarMetasResponse


@router.post(
    "/metas/replicar",
    response_model=ReplicarMetasResponse,
    tags=["metas"],
    summary="Replicar metas para múltiplos períodos"
)
def replicar_metas_endpoint(
    request: ReplicarMetasRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(usuario_atual)
):
    """
    Replica metas de um período para vários períodos com detecção de conflitos.
    
    **Fluxo:**
    1. Usuário preenche metas de Janeiro
    2. Clica "Replicar para próximos meses"
    3. Sistema retorna 202 se há conflitos, ou 200 se sucesso
    4. Se 202, usuário escolhe sobrescrever (sobrescrever_conflitos=True)
    5. Segunda chamada com sobrescrita processa as atualizações
    
    **Resposta 202 (Conflitos):**
    ```json
    {
        "status": "conflitos_detectados",
        "mensagem": "3 conflitos encontrados",
        "metas_criadas": 5,
        "conflitos": [...]
    }
    ```
    
    **Resposta 200 (Sucesso):**
    ```json
    {
        "status": "sucesso",
        "mensagem": "Metas replicadas com sucesso",
        "metas_criadas": 40,
        "metas_atualizadas": 0,
        "total_processadas": 40
    }
    ```
    """
    
    # Validar autorização
    if current_user.perfil == "vendedor":
        raise HTTPException(
            status_code=403,
            detail="Vendedores não podem replicar metas"
        )
    
    # Gerentes só podem replicar para seus vendedores
    if current_user.perfil == "gerente":
        vendedor = db.get(Vendedor, request.vendedor_id)
        
        if not vendedor or vendedor.gerente_id != current_user.gerente_id:
            raise HTTPException(
                status_code=403,
                detail="Você só pode replicar metas de seus vendedores"
            )
    
    # Executar replicação
    response, status_code = meta_service.replicar_metas(
        db=db,
        request=request,
        usuario_id=current_user.id,
        usuario_perfil=current_user.perfil
    )
    
    if status_code == 202:
        from fastapi.responses import Response
        return Response(
            content=response.model_dump_json(),
            status_code=202,
            media_type='application/json'
        )
    return response
