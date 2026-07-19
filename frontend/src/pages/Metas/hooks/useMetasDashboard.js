import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function useMetasDashboard() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [dados, setDados] = useState(null);

  const carregarDashboard = useCallback(async (filtros) => {
    if (!filtros.vendedor_id) {
      setDados(null);
      return;
    }

    setLoading(true);
    setErro("");

    try {
      // Construir query params
      const params = new URLSearchParams({
        vendedor_id: filtros.vendedor_id,
        ano: filtros.ano || new Date().getFullYear(),
        mes: filtros.mes || new Date().getMonth() + 1,
      });

      // TODO: Chamar endpoint real quando disponível
      // const response = await axios.get(`${API_BASE_URL}/metas/dashboard?${params}`);
      // setDados(response.data);

      // Por enquanto, dados mock
      const dadosMock = {
        resumo: {
          meta_total: 16750,
          realizado_total: 8900,
          percentual_atingimento: 53.1,
          trend: "↗ +12%",
        },
        produtos: [
          {
            produto_id: 1,
            nome: "Setup",
            meta: 2200,
            realizado: 1800,
            percentual: 81.8,
            status: "warning",
            variacao: -18.2,
          },
          {
            produto_id: 2,
            nome: "MRR",
            meta: 3300,
            realizado: 3400,
            percentual: 103,
            status: "success",
            variacao: 3.0,
          },
          {
            produto_id: 3,
            nome: "Projeto",
            meta: 1500,
            realizado: 1200,
            percentual: 80,
            status: "warning",
            variacao: -20,
          },
          {
            produto_id: 4,
            nome: "NREC",
            meta: 5000,
            realizado: 1500,
            percentual: 30,
            status: "danger",
            variacao: -70,
          },
          {
            produto_id: 5,
            nome: "REC",
            meta: 2750,
            realizado: 2600,
            percentual: 94.5,
            status: "success",
            variacao: -5.5,
          },
          {
            produto_id: 6,
            nome: "SCS",
            meta: 1200,
            realizado: 900,
            percentual: 75,
            status: "warning",
            variacao: -25,
          },
          {
            produto_id: 7,
            nome: "AMS",
            meta: 800,
            realizado: 500,
            percentual: 62.5,
            status: "warning",
            variacao: -37.5,
          },
        ],
        historico_30_dias: [
          { data: "2026-01-01", meta: 16750, realizado: 5000 },
          { data: "2026-01-02", meta: 16750, realizado: 5200 },
          { data: "2026-01-03", meta: 16750, realizado: 5400 },
          { data: "2026-01-04", meta: 16750, realizado: 5800 },
          { data: "2026-01-05", meta: 16750, realizado: 6200 },
          { data: "2026-01-06", meta: 16750, realizado: 6500 },
          { data: "2026-01-07", meta: 16750, realizado: 7000 },
          { data: "2026-01-08", meta: 16750, realizado: 7300 },
          { data: "2026-01-09", meta: 16750, realizado: 7600 },
          { data: "2026-01-10", meta: 16750, realizado: 8000 },
          { data: "2026-01-11", meta: 16750, realizado: 8300 },
          { data: "2026-01-12", meta: 16750, realizado: 8600 },
          { data: "2026-01-13", meta: 16750, realizado: 8900 },
        ],
      };

      setDados(dadosMock);
    } catch (e) {
      setErro(e.message || "Erro ao carregar dashboard");
      setDados(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, erro, dados, carregarDashboard };
}
