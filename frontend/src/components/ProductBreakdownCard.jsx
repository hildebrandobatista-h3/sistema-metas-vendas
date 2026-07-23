import { useState, useEffect } from "react";
import { moeda } from "./ui.jsx";
import { buscarBreakdownProdutos } from "../services/api.js";

function corPct(p) {
  return p >= 90 ? "#107c10" : p >= 70 ? "#0078d4" : "#d13438";
}

export default function ProductBreakdownCard({ filtros }) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    setCarregando(true);
    setErro(null);
    buscarBreakdownProdutos(filtros)
      .then(setDados)
      .catch(() => setErro("Não foi possível carregar o breakdown."))
      .finally(() => setCarregando(false));
  }, [
    filtros.ano, filtros.periodo_tipo, filtros.periodo_ref,
    filtros.empresa_id, filtros.unidade_id, filtros.gerente_id,
    filtros.vendedor_id, filtros.produto_id,
  ]);

  if (carregando) return <p style={{ fontSize: "13px", color: "#626c7d", margin: "8px 0" }}>Carregando breakdown…</p>;
  if (erro) return <p style={{ fontSize: "13px", color: "#d13438", margin: "8px 0" }}>{erro}</p>;
  if (!dados || dados.produtos.length === 0) return null;

  const comDados = dados.produtos.filter(p => parseFloat(p.meta_total) > 0 || parseFloat(p.realizado_total) > 0);
  const semDados = dados.produtos.filter(p => parseFloat(p.meta_total) === 0 && parseFloat(p.realizado_total) === 0);

  return (
    <div style={{
      border: "0.5px solid #e0e7ef",
      borderRadius: "12px",
      padding: "1.5rem",
      background: "white",
      marginBottom: "1rem",
    }}>
      <p style={{ fontWeight: 600, fontSize: "13px", color: "#374151", marginBottom: "12px" }}>
        Breakdown por produto
      </p>
      <div style={{ display: "grid", gap: "6px" }}>
        {comDados.map(p => (
          <div key={p.produto_id} style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto",
            gap: "12px",
            alignItems: "center",
            padding: "8px 4px",
            borderBottom: "0.5px solid #f3f4f6",
            fontSize: "13px",
          }}>
            <span style={{ color: "#111827", fontWeight: 500 }}>{p.produto_nome}</span>
            <span style={{ color: "#626c7d", textAlign: "right", minWidth: "90px" }}>{moeda(p.meta_total)}</span>
            <span style={{ color: "#111827", fontWeight: 500, textAlign: "right", minWidth: "90px" }}>{moeda(p.realizado_total)}</span>
            <span style={{
              fontWeight: 600,
              color: corPct(p.percentual),
              textAlign: "right",
              minWidth: "50px",
            }}>{p.percentual}%</span>
          </div>
        ))}
        {semDados.map(p => (
          <div key={p.produto_id} style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto",
            gap: "12px",
            alignItems: "center",
            padding: "8px 4px",
            borderBottom: "0.5px solid #f3f4f6",
            fontSize: "13px",
            opacity: 0.4,
          }}>
            <span style={{ color: "#626c7d" }}>{p.produto_nome}</span>
            <span style={{ color: "#626c7d", textAlign: "right", minWidth: "90px" }}>—</span>
            <span style={{ color: "#626c7d", textAlign: "right", minWidth: "90px" }}>—</span>
            <span style={{ color: "#626c7d", textAlign: "right", minWidth: "50px" }}>—</span>
          </div>
        ))}
      </div>
      {comDados.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto auto",
          gap: "12px",
          padding: "10px 4px 0",
          fontSize: "12px",
          color: "#9ca3af",
        }}>
          <span />
          <span style={{ textAlign: "right", minWidth: "90px" }}>Meta</span>
          <span style={{ textAlign: "right", minWidth: "90px" }}>Realizado</span>
          <span style={{ textAlign: "right", minWidth: "50px" }}>%</span>
        </div>
      )}
    </div>
  );
}
