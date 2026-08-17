"""Endpoints para sincronizar oportunidades ganhas do NectarCRM com a tabela intermediária."""
import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.orm import aliased

from ..db import get_db, SessionLocal
from ..deps import usuario_atual, so_admin
from ..models import ParamIntegracao, OportunidadeNectar, Usuario

router = APIRouter(tags=["sincronizacao"], prefix="/sincronizacao")

UsuarioCriador = aliased(Usuario, flat=True)
UsuarioAtualizador = aliased(Usuario, flat=True)


@router.get("/oportunidades")
def listar_oportunidades_sincronizadas(
    status: str | None = None,
    _: Usuario = Depends(usuario_atual),
    db=Depends(get_db)
):
    """Lista oportunidades sincronizadas do NectarCRM com nomes de usuários resolvidos."""
    stmt = (
        select(OportunidadeNectar, UsuarioCriador.nome, UsuarioAtualizador.nome)
        .outerjoin(UsuarioCriador, OportunidadeNectar.criado_por == UsuarioCriador.id)
        .outerjoin(UsuarioAtualizador, OportunidadeNectar.atualizado_por == UsuarioAtualizador.id)
        .order_by(OportunidadeNectar.data_sincronizacao.desc())
    )
    if status:
        stmt = stmt.where(OportunidadeNectar.status_sincronizacao == status)

    rows = db.execute(stmt).all()
    result = []
    for opp, nome_criador, nome_atualizador in rows:
        d = {
            "id": opp.id,
            "param_integracao_id": opp.param_integracao_id,
            "id_oportunidade_ext": opp.id_oportunidade_ext,
            "nome": opp.nome,
            "cliente": opp.cliente,
            "valor": float(opp.valor) if opp.valor is not None else None,
            "responsavel": opp.responsavel,
            "status_sincronizacao": opp.status_sincronizacao,
            "data_sincronizacao": opp.data_sincronizacao.isoformat() if opp.data_sincronizacao else None,
            "mensagem_erro": opp.mensagem_erro,
            "criado_em": opp.criado_em.isoformat() if opp.criado_em else None,
            "atualizado_em": opp.atualizado_em.isoformat() if opp.atualizado_em else None,
            "criado_por": opp.criado_por,
            "atualizado_por": opp.atualizado_por,
            "criado_por_nome": nome_criador,
            "atualizado_por_nome": nome_atualizador,
        }
        result.append(d)
    return result


@router.post("/sincronizar")
async def sincronizar_oportunidades(
    background_tasks: BackgroundTasks,
    _: Usuario = Depends(so_admin),
    db=Depends(get_db)
):
    """Sincroniza oportunidades ganhas do NectarCRM (executa em background)."""
    stmt = select(ParamIntegracao).where(
        ParamIntegracao.tipo_integracao == "nectar_crm",
        ParamIntegracao.ativo.is_(True)
    )
    param = db.scalars(stmt).first()

    if not param:
        raise HTTPException(404, "Nenhuma integração do NectarCRM configurada")

    # Passa apenas o ID — a task abre sua própria sessão
    background_tasks.add_task(_sincronizar_nectar, param.id)

    return {"mensagem": "Sincronização iniciada em background"}


async def _sincronizar_nectar(param_id: int):
    """Task de background — abre sessão própria para não depender da sessão do request."""
    db = SessionLocal()
    try:
        param = db.get(ParamIntegracao, param_id)
        if not param:
            return

        async with httpx.AsyncClient(timeout=30) as client:
            # status=2 = oportunidades ganhas no NectarCRM
            url = f"{param.endpoint_base}/oportunidades/?api_token={param.token}&status=2"
            response = await client.get(url)

            if response.status_code != 200:
                param.status_ultimo_teste = "erro"
                param.mensagem_erro = f"HTTP {response.status_code} da API NectarCRM"
                param.ultima_sincronizacao = datetime.now(timezone.utc)
                db.commit()
                return

            oportunidades = response.json()
            if not isinstance(oportunidades, list):
                oportunidades = []

            for opp in oportunidades:
                stmt = select(OportunidadeNectar).where(
                    OportunidadeNectar.param_integracao_id == param.id,
                    OportunidadeNectar.id_oportunidade_ext == opp.get("id")
                )
                existing = db.scalars(stmt).first()

                cliente_data = opp.get("cliente", {})
                cliente_nome = (
                    cliente_data.get("nome")
                    if isinstance(cliente_data, dict)
                    else str(cliente_data)
                )

                responsavel_data = opp.get("responsavel", {})
                responsavel_nome = (
                    responsavel_data.get("nome")
                    if isinstance(responsavel_data, dict)
                    else None
                )

                valor_raw = opp.get("valorTotal") or opp.get("valor")
                valor = float(valor_raw) if valor_raw else None

                if existing:
                    # Atualiza dados vindos do Nectar; preserva status e mensagem_erro
                    existing.nome = opp.get("nome", existing.nome)
                    existing.cliente = cliente_nome
                    existing.valor = valor
                    existing.responsavel = responsavel_nome
                    existing.data_sincronizacao = datetime.now(timezone.utc)
                else:
                    new_opp = OportunidadeNectar(
                        param_integracao_id=param.id,
                        id_oportunidade_ext=opp.get("id"),
                        nome=opp.get("nome", ""),
                        cliente=cliente_nome,
                        valor=valor,
                        responsavel=responsavel_nome,
                        status_sincronizacao="pendente",
                        data_sincronizacao=datetime.now(timezone.utc),
                        mensagem_erro=None,
                    )
                    db.add(new_opp)

            param.status_ultimo_teste = "sucesso"
            param.mensagem_erro = None
            param.ultima_sincronizacao = datetime.now(timezone.utc)
            db.commit()

    except Exception as e:
        try:
            param = db.get(ParamIntegracao, param_id)
            if param:
                param.status_ultimo_teste = "erro"
                param.mensagem_erro = str(e)
                param.ultima_sincronizacao = datetime.now(timezone.utc)
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


@router.post("/oportunidades/{id_}/mapear")
def mapear_oportunidade(
    id_: int,
    _: Usuario = Depends(so_admin),
    db=Depends(get_db)
):
    """Mapeia uma oportunidade para um realizado existente."""
    opp = db.get(OportunidadeNectar, id_)
    if not opp:
        raise HTTPException(404, "Oportunidade não encontrada")

    opp.status_sincronizacao = "mapeado"
    opp.data_sincronizacao = datetime.now(timezone.utc)
    db.commit()
    db.refresh(opp)
    return opp


@router.delete("/oportunidades/{id_}")
def ignorar_oportunidade(
    id_: int,
    _: Usuario = Depends(so_admin),
    db=Depends(get_db)
):
    """Marca uma oportunidade como ignorada."""
    opp = db.get(OportunidadeNectar, id_)
    if not opp:
        raise HTTPException(404, "Oportunidade não encontrada")

    opp.status_sincronizacao = "ignorado"
    db.commit()
    return {"ok": True}
