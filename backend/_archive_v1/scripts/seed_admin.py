"""Cria o primeiro usuário Admin — não existe endpoint público pra isso
propositalmente (criar o 1º Admin via API seria uma brecha de segurança).

Uso:
    python scripts/seed_admin.py --email admin@empresa.com --senha "..." --nome "Admin"
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.enums import PapelUsuario
from app.models.usuario import Usuario


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--email", required=True)
    parser.add_argument("--senha", required=True)
    parser.add_argument("--nome", default="Administrador")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        if db.query(Usuario).filter(Usuario.email == args.email).first():
            print(f"Já existe um usuário com o email {args.email}.")
            return

        usuario = Usuario(
            empresa_id=None,
            nome=args.nome,
            email=args.email,
            hashed_password=hash_password(args.senha),
            papel=PapelUsuario.ADMIN,
            ativo=True,
        )
        db.add(usuario)
        db.commit()
        print(f"Admin criado: {args.email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
