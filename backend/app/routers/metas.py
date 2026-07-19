"""Endpoints de meta (protegidos).
Escrita: apenas admin. Leitura: admin tudo; gerente seus vendedores; vendedor o seu.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, and_, Date, cast
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..db import get_db
from ..deps import usuario_atual, so_admin, vendedores_visiveis
from ..models import Meta, Produto, Periodo, Usuario, Vendedor, Realizado
from ..schemas.metas import MetaLoteCreate, MetaUpdate, MetaOut, ReplicarMetasRequest, ReplicarMetasResponse
from ._helpers import resolver_hierarquia, get_or_create_periodo

from ..services.replicacao_service import replicar_metas
from ..services import replicacao_service as meta_service
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
        request=request
    )
    
    if status_code == 202:
        from fastapi.responses import Response
        return Response(
            content=response.model_dump_json(),
            status_code=202,
            media_type='application/json'
        )
    return response


# ============ DASHBOARD COM DADOS REAIS ============

@router.get("/metas/dashboard")
def get_dashboard(
    vendedor_id: int,
    periodo_id: int,
    empresa_id: int = None,
    unidade_id: int = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(usuario_atual)
):
    """Retorna dashboard com dados REAIS do banco PostgreSQL."""
    try:
        if current_user.perfil == "vendedor":
            if current_user.vendedor_id != vendedor_id:
                raise HTTPException(status_code=403, detail="Sem permissão")

        # Query 1: Resumo Total
        resumo_query = db.query(
            func.sum(Meta.valor).label("meta_total"),
            func.coalesce(func.sum(Realizado.valor), 0).label("realizado_total")
        ).outerjoin(
            Realizado,
            and_(
                Realizado.produto_id == Meta.produto_id,
                Realizado.vendedor_id == Meta.vendedor_id,
                Realizado.ativo == True
            )
        ).filter(
            Meta.vendedor_id == vendedor_id,
            Meta.periodo_id == periodo_id,
            Meta.ativo == True
        )

        if empresa_id:
            resumo_query = resumo_query.filter(Meta.empresa_id == empresa_id)
        if unidade_id:
            resumo_query = resumo_query.filter(Meta.unidade_id == unidade_id)

        resumo_result = resumo_query.first()

        meta_total = float(resumo_result[0]) if resumo_result[0] else 0
        realizado_total = float(resumo_result[1]) if resumo_result[1] else 0

        percentual_atingimento = (
            (realizado_total / meta_total * 100)
            if meta_total > 0
            else 0
        )

        trend = f"↗ +{percentual_atingimento - 100:.1f}%" if percentual_atingimento > 100 else "↔️ 0%"

        # Query 2: Produtos (por linha)
        produtos_query = db.query(
            Produto.id.label("produto_id"),
            Produto.nome.label("produto_nome"),
            func.sum(Meta.valor).label("meta"),
            func.coalesce(func.sum(Realizado.valor), 0).label("realizado")
        ).join(
            Meta,
            Meta.produto_id == Produto.id
        ).outerjoin(
            Realizado,
            and_(
                Realizado.produto_id == Produto.id,
                Realizado.vendedor_id == vendedor_id,
                Realizado.ativo == True
            )
        ).filter(
            Meta.vendedor_id == vendedor_id,
            Meta.periodo_id == periodo_id,
            Meta.ativo == True
        )

        if empresa_id:
            produtos_query = produtos_query.filter(Meta.empresa_id == empresa_id)
        if unidade_id:
            produtos_query = produtos_query.filter(Meta.unidade_id == unidade_id)

        produtos_query = produtos_query.group_by(
            Produto.id,
            Produto.nome
        ).order_by(Produto.nome)

        produtos_results = produtos_query.all()

        produtos = []
        for prod in produtos_results:
            meta_val = float(prod.meta) if prod.meta else 0
            realizado_val = float(prod.realizado) if prod.realizado else 0

            percentual = (
                (realizado_val / meta_val * 100)
                if meta_val > 0
                else 0
            )

            if percentual >= 95:
                status = "success"
            elif percentual >= 80:
                status = "warning"
            else:
                status = "danger"

            variacao = percentual - 100

            produtos.append({
                "produto_id": prod.produto_id,
                "nome": prod.produto_nome,
                "meta": meta_val,
                "realizado": realizado_val,
                "percentual": round(percentual, 1),
                "status": status,
                "variacao": round(variacao, 1)
            })

        # Query 3: Histórico 30 dias
        data_inicio = datetime.now() - timedelta(days=30)

        historico_results = db.query(
            cast(Realizado.data_venda, Date).label("data"),
            func.sum(Realizado.valor).label("realizado_dia")
        ).filter(
            Realizado.vendedor_id == vendedor_id,
            Realizado.data_venda >= data_inicio,
            Realizado.ativo == True
        )

        if empresa_id:
            historico_results = historico_results.filter(Realizado.empresa_id == empresa_id)
        if unidade_id:
            historico_results = historico_results.filter(Realizado.unidade_id == unidade_id)

        historico_results = historico_results.group_by(
            cast(Realizado.data_venda, Date)
        ).order_by(cast(Realizado.data_venda, Date)).all()

        historico = []
        acumulado_realizado = 0

        for hist in historico_results:
            acumulado_realizado += float(hist.realizado_dia) if hist.realizado_dia else 0

            historico.append({
                "data": hist.data.isoformat() if hist.data else None,
                "meta": meta_total,
                "realizado": acumulado_realizado
            })

        if not historico:
            historico = [
                {
                    "data": datetime.now().isoformat(),
                    "meta": meta_total,
                    "realizado": realizado_total
                }
            ]

        return {
            "resumo": {
                "meta_total": meta_total,
                "realizado_total": realizado_total,
                "percentual_atingimento": round(percentual_atingimento, 1),
                "trend": trend
            },
            "produtos": produtos,
            "historico_30_dias": historico
        }

    except Exception as e:
        print(f"Erro ao buscar dashboard: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao buscar dados: {str(e)}"
        )
