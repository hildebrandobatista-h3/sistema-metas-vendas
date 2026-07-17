import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

_raw = os.getenv("DATABASE_URL", "sqlite:///./_dev.db")
if _raw.startswith("postgresql://"):
    _raw = _raw.replace("postgresql://", "postgresql+psycopg://", 1)
DATABASE_URL = _raw

_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=_connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
