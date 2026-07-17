from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.models.enums import PapelUsuario, TipoNo
from app.models.estrutura_no import EstruturaNo
from app.models.usuario import Usuario


def get_no_do_usuario(db: Session, usuario: Usuario) -> EstruturaNo | None:
    """Nó da árvore que representa este usuário. Admin é global e não tem nó — retorna None."""
    if usuario.papel == PapelUsuario.ADMIN:
        return None
    tipo_no = TipoNo(usuario.papel.value)
    return (
        db.query(EstruturaNo)
        .filter(EstruturaNo.tipo == tipo_no, EstruturaNo.ref_id == usuario.id)
        .first()
    )


def get_filhos_diretos(db: Session, no_id: uuid.UUID) -> list[EstruturaNo]:
    return db.query(EstruturaNo).filter(EstruturaNo.no_pai_id == no_id).all()


def get_subarvore_ids(db: Session, no_id: uuid.UUID) -> set[uuid.UUID]:
    """IDs do próprio nó + todos os descendentes (BFS sobre no_pai_id)."""
    ids: set[uuid.UUID] = {no_id}
    fila = [no_id]
    while fila:
        atual = fila.pop()
        filhos = db.query(EstruturaNo.id).filter(EstruturaNo.no_pai_id == atual).all()
        for (filho_id,) in filhos:
            if filho_id not in ids:
                ids.add(filho_id)
                fila.append(filho_id)
    return ids


def escopo_no_ids(db: Session, usuario: Usuario) -> set[uuid.UUID] | None:
    """IDs de nós visíveis para este usuário. None = sem restrição (Admin, global)."""
    if usuario.papel == PapelUsuario.ADMIN:
        return None
    no = get_no_do_usuario(db, usuario)
    if no is None:
        return set()
    return get_subarvore_ids(db, no.id)
