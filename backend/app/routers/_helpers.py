from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Vendedor, Gerente, Unidade, Periodo


def resolver_hierarquia(db: Session, vendedor_id: int) -> dict:
    vend = db.get(Vendedor, vendedor_id)
    if vend is None or not vend.ativo:
        raise HTTPException(404, "vendedor nao encontrado ou inativo")
    ger = db.get(Gerente, vend.gerente_id)
    uni = db.get(Unidade, ger.unidade_id)
    return {
        "vendedor_id": vend.id,
        "gerente_id": ger.id,
        "unidade_id": uni.id,
        "empresa_id": uni.empresa_id,
    }


def get_or_create_periodo(db: Session, ano: int, mes: int) -> Periodo:
    per = db.scalar(select(Periodo).where(Periodo.ano == ano, Periodo.mes == mes))
    if per is None:
        per = Periodo(ano=ano, mes=mes)
        db.add(per)
        db.flush()
    return per
