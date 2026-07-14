from __future__ import annotations

import os

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only")

from dataclasses import dataclass
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db, habilitar_foreign_keys_sqlite
from app.core.security import create_access_token, hash_password
from app.core.views import VIEWS_CRIACAO
from app.main import app
from app.models.competencia import Competencia
from app.models.empresa import Empresa
from app.models.enums import PapelUsuario, StatusCompetencia, StatusMeta, TipoMedida, TipoNo
from app.models.estrutura_no import EstruturaNo
from app.models.meta import Meta
from app.models.produto import Produto
from app.models.unidade_negocio import UnidadeNegocio
from app.models.usuario import Usuario


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    habilitar_foreign_keys_sqlite(engine)
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        for sql in VIEWS_CRIACAO:
            conn.execute(text(sql))
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def auth_headers(usuario: Usuario) -> dict:
    token = create_access_token(subject=str(usuario.id), papel=usuario.papel.value)
    return {"Authorization": f"Bearer {token}"}


@dataclass
class Arvore:
    empresa: Empresa
    unidade: UnidadeNegocio
    admin: Usuario
    diretor: Usuario
    gerente: Usuario
    vendedor: Usuario
    no_empresa: EstruturaNo
    no_unidade: EstruturaNo
    no_diretor: EstruturaNo
    no_gerente: EstruturaNo
    no_vendedor: EstruturaNo
    produto: Produto


@pytest.fixture()
def arvore(db_session) -> Arvore:
    """Monta empresa > unidade > diretor > gerente > vendedor + 1 produto,
    igual ao exemplo usado nos mockups da Etapa 1."""
    empresa = Empresa(razao_social="Aurora Distribuidora Ltda", cnpj="11.222.333/0001-44")
    db_session.add(empresa)
    db_session.flush()
    no_empresa = EstruturaNo(empresa_id=empresa.id, tipo=TipoNo.EMPRESA, no_pai_id=None, ref_id=empresa.id)
    db_session.add(no_empresa)
    db_session.flush()

    unidade = UnidadeNegocio(empresa_id=empresa.id, nome="Unidade Sudeste")
    db_session.add(unidade)
    db_session.flush()
    no_unidade = EstruturaNo(
        empresa_id=empresa.id, tipo=TipoNo.UNIDADE, no_pai_id=no_empresa.id, ref_id=unidade.id
    )
    db_session.add(no_unidade)
    db_session.flush()

    admin = Usuario(
        empresa_id=None,
        nome="Admin Global",
        email="admin@aurora.com.br",
        hashed_password=hash_password("senha-forte"),
        papel=PapelUsuario.ADMIN,
    )
    diretor = Usuario(
        empresa_id=empresa.id,
        nome="Fernanda Alves",
        email="fernanda@aurora.com.br",
        hashed_password=hash_password("senha-forte"),
        papel=PapelUsuario.DIRETOR,
        unidade_id=unidade.id,
    )
    db_session.add_all([admin, diretor])
    db_session.flush()
    no_diretor = EstruturaNo(
        empresa_id=empresa.id, tipo=TipoNo.DIRETOR, no_pai_id=no_unidade.id, ref_id=diretor.id
    )
    db_session.add(no_diretor)
    db_session.flush()

    gerente = Usuario(
        empresa_id=empresa.id,
        nome="Rodrigo Lima",
        email="rodrigo@aurora.com.br",
        hashed_password=hash_password("senha-forte"),
        papel=PapelUsuario.GERENTE,
        superior_id=diretor.id,
    )
    db_session.add(gerente)
    db_session.flush()
    no_gerente = EstruturaNo(
        empresa_id=empresa.id, tipo=TipoNo.GERENTE, no_pai_id=no_diretor.id, ref_id=gerente.id
    )
    db_session.add(no_gerente)
    db_session.flush()

    vendedor = Usuario(
        empresa_id=empresa.id,
        nome="Camila Nogueira",
        email="camila@aurora.com.br",
        hashed_password=hash_password("senha-forte"),
        papel=PapelUsuario.VENDEDOR,
        superior_id=gerente.id,
    )
    db_session.add(vendedor)
    db_session.flush()
    no_vendedor = EstruturaNo(
        empresa_id=empresa.id, tipo=TipoNo.VENDEDOR, no_pai_id=no_gerente.id, ref_id=vendedor.id
    )
    db_session.add(no_vendedor)

    produto = Produto(empresa_id=empresa.id, nome="Cafeteira Inox 1.5L")
    db_session.add(produto)

    db_session.commit()

    return Arvore(
        empresa=empresa,
        unidade=unidade,
        admin=admin,
        diretor=diretor,
        gerente=gerente,
        vendedor=vendedor,
        no_empresa=no_empresa,
        no_unidade=no_unidade,
        no_diretor=no_diretor,
        no_gerente=no_gerente,
        no_vendedor=no_vendedor,
        produto=produto,
    )


@pytest.fixture()
def competencia_aberta(db_session, arvore: Arvore) -> Competencia:
    competencia = Competencia(empresa_id=arvore.empresa.id, ano=2026, mes=7, status=StatusCompetencia.ABERTA)
    db_session.add(competencia)
    db_session.commit()
    return competencia


@dataclass
class CenarioVenda:
    competencia: Competencia
    meta: Meta


@pytest.fixture()
def cenario_venda(db_session, arvore: Arvore, competencia_aberta: Competencia) -> CenarioVenda:
    """Competência PUBLICADA + meta PUBLICADA pro vendedor/produto padrão —
    pré-condições para lançar uma venda válida."""
    meta = Meta(
        competencia_id=competencia_aberta.id,
        estrutura_no_id=arvore.no_vendedor.id,
        produto_id=arvore.produto.id,
        tipo_medida=TipoMedida.QUANTIDADE,
        valor_meta=Decimal("40"),
        status=StatusMeta.PUBLICADA,
    )
    db_session.add(meta)
    competencia_aberta.status = StatusCompetencia.PUBLICADA
    db_session.commit()
    db_session.refresh(meta)
    return CenarioVenda(competencia=competencia_aberta, meta=meta)
