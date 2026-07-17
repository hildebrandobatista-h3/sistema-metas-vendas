"""SQL das views de dashboard — compartilhado entre a migration Alembic e o
setup de banco dos testes (que usa Base.metadata.create_all(), não Alembic).

Nenhuma view grava percentual pronto — sempre somas brutas de meta e
realizado, para que soma/soma nunca vire média de % (regra inegociável).
"""

VW_ESTRUTURA_FECHAMENTO = """
CREATE VIEW vw_estrutura_fechamento AS
WITH RECURSIVE fechamento(ancestral_id, descendente_id) AS (
    SELECT id, id FROM estrutura_no
    UNION ALL
    SELECT f.ancestral_id, e.id
    FROM fechamento f
    JOIN estrutura_no e ON e.no_pai_id = f.descendente_id
)
SELECT ancestral_id, descendente_id FROM fechamento
"""

VW_REALIZADO_NO = """
CREATE VIEW vw_realizado_no AS
SELECT
    f.ancestral_id AS estrutura_no_id,
    v.competencia_id,
    v.produto_id,
    v.tipo_medida,
    SUM(v.valor_lancado) AS realizado
FROM venda v
JOIN vw_estrutura_fechamento f ON f.descendente_id = v.vendedor_no_id
GROUP BY f.ancestral_id, v.competencia_id, v.produto_id, v.tipo_medida
"""

VW_ATINGIMENTO = """
CREATE VIEW vw_atingimento AS
SELECT
    m.id AS meta_id,
    m.estrutura_no_id,
    m.competencia_id,
    m.produto_id,
    m.tipo_medida,
    m.status AS meta_status,
    m.valor_meta AS meta,
    COALESCE(r.realizado, 0) AS realizado
FROM meta m
LEFT JOIN vw_realizado_no r
    ON r.estrutura_no_id = m.estrutura_no_id
    AND r.competencia_id = m.competencia_id
    AND r.produto_id = m.produto_id
"""

# Ordem de criação (dependências: fechamento -> realizado -> atingimento).
VIEWS_CRIACAO = [VW_ESTRUTURA_FECHAMENTO, VW_REALIZADO_NO, VW_ATINGIMENTO]

# Ordem de remoção — inversa.
VIEWS_NOMES_REMOCAO = ["vw_atingimento", "vw_realizado_no", "vw_estrutura_fechamento"]
