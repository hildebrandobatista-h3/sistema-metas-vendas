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
    const params = {
      ano: Number(filtros.ano),
      periodo_tipo: filtros.tipo,
      periodo_ref: Number(filtros.ref),
    };
    if (filtros.empresa) params.empresa_id = Number(filtros.empresa);
    if (filtros.unidade) params.unidade_id = Number(filtros.unidade);
    if (filtros.gerente) params.gerente_id = Number(filtros.gerente);
    if (filtros.vendedor) params.vendedor_id = Number(filtros.vendedor);

    buscarBreakdownProdutos(params)
      .then(setDados)
      .catch(() => setErro("Não foi possível carregar o breakdown."))
      .finally(() => setCarregando(false));
  }, [filtros]);

  return (
    <div style={{ background: "white", border: "0.5px solid #e5e7eb", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
      <p style={{ fontWeight: "600", fontSize: "14px", marginBottom: "12px", color: "#111" }}>
        Breakdown por produto
      </p>

      {carregando && <p style={{ fontSize: "13px", color: "#888" }}>Carregando…</p>}
      {erro && <p style={{ fontSize: "13px", color: "#d13438" }}>{erro}</p>}

      {dados && !carregando && (
        dados.produtos.length === 0
          ? <p style={{ fontSize: "13px", color: "#888" }}>Sem dados para este período.</p>
          : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ textAlign: "left", padding: "8px", fontWeight: "500", borderBottom: "0.5px solid #e5e7eb" }}>Produto</th>
                  <th style={{ textAlign: "right", padding: "8px", fontWeight: "500", borderBottom: "0.5px solid #e5e7eb" }}>Meta</th>
                  <th style={{ textAlign: "right", padding: "8px", fontWeight: "500", borderBottom: "0.5px solid #e5e7eb" }}>Realizado</th>
                  <th style={{ textAlign: "right", padding: "8px", fontWeight: "500", borderBottom: "0.5px solid #e5e7eb" }}>%</th>
                </tr>
              </thead>
              <tbody>
                {dados.produtos.map((p, i) => (
                  <tr key={i} style={{ borderBottom: "0.5px solid #e5e7eb" }}>
                    <td style={{ padding: "8px" }}>{p.produto_nome}</td>
                    <td style={{ padding: "8px", textAlign: "right" }}>{moeda(p.meta)}</td>
                    <td style={{ padding: "8px", textAlign: "right" }}>{moeda(p.realizado)}</td>
                    <td style={{ padding: "8px", textAlign: "right", fontWeight: "600", color: corPct(p.percentual) }}>
                      {p.percentual}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
      )}
    </div>
  );
}
