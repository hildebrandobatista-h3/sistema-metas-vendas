from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def habilitar_foreign_keys_sqlite(engine_alvo: Engine) -> None:
    """SQLite não impõe FOREIGN KEY por padrão (precisa ser ligado por
    conexão). Sem isso, testes/dev local deixam passar referências inválidas
    que o Postgres de produção rejeitaria — bug real encontrado ao popular
    dados de teste manualmente. Usado tanto pelo engine da app quanto pelo
    engine de testes (tests/conftest.py), que é um engine separado."""
    if engine_alvo.dialect.name != "sqlite":
        return

    @event.listens_for(engine_alvo, "connect")
    def _habilitar(dbapi_connection, _):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


habilitar_foreign_keys_sqlite(engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
