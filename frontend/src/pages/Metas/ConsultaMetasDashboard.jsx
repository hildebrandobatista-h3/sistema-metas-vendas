import { useState, useEffect } from "react";
import { Campo, Select, Botao, Aviso } from "../../components/ui.jsx";
import KPICard from "./components/KPICard";
import MetasComparativoTable from "./components/MetasComparativoTable";
import BarChartMetasVsRealizado from "./components/charts/BarChartMetasVsRealizado";
import PieChartDistribuicao from "./components/charts/PieChartDistribuicao";
import LineChartTendencia from "./components/charts/LineChartTendencia";
import { useMetasDashboard } from "./hooks/useMetasDashboard";
import {
  listarEmpresas, listarUnidades, listarGerentes, listarVendedores,
  listarProdutos,
} from "../../services/api.js";

const MESES = [["1","Jan"],["2","Fev"],["3","Mar"],["4","Abr"],["5","Mai"],["6","Jun"],
  ["7","Jul"],["8","Ago"],["9","Set"],["10","Out"],["11","Nov"],["12","Dez"]];

export default function ConsultaMetasDashboard({ filtros, onFiltroChange }) {
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [gerentes, setGerentes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const { loading, erro: erroDashboard, dados: dashboardData, carregarDashboard } = useMetasDashboard();
  const [alerta, setAlerta] = useState("");

  useEffect(() => {
    listarEmpresas().then(setEmpresas).catch(() => {});
    listarProdutos().then(setProdutos).catch(() => {});
  }, []);

  useEffect(() => {
    setUnidades([]);
    if (filtros.empresa_id) {
      listarUnidades(filtros.empresa_id).then(setUnidades).catch(() => {});
    }
  }, [filtros.empresa_id]);

  useEffect(() => {
    setGerentes([]);
    if (filtros.unidade_id) {
      listarGerentes(filtros.unidade_id).then(setGerentes).catch(() => {});
    }
  }, [filtros.unidade_id]);

  useEffect(() => {
    setVendedores([]);
    if (filtros.gerente_id) {
      listarVendedores(filtros.gerente_id).then(setVendedores).catch(() => {});
    }
  }, [filtros.gerente_id]);

  useEffect(() => {
    carregarDashboard(filtros);
  }, [filtros.vendedor_id, filtros.ano, filtros.mes]);

  useEffect(() => {
    if (dashboardData && dashboardData.produtos) {
      const nrec = dashboardData.produtos.find((p) => p.nome === "NREC");
      if (nrec && nrec.status === "danger") {
        setAlerta(`⚠️ ALERTA: ${nrec.nome} está ${Math.abs(nrec.variacao).toFixed(1)}% abaixo da meta. Revisar estratégia.`);
      } else {
        setAlerta("");
      }
    }
  }, [dashboardData]);

  const handleExportarCSV = () => {
    if (!dashboardData) return;
    const csv = [
      ["Produto", "Meta", "Realizado", "%", "Variação"],
      ...dashboardData.produtos.map((p) => [
        p.nome,
        p.meta,
        p.realizado,
        p.percentual.toFixed(1),
        p.variacao.toFixed(1),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metas_${filtros.mes}_${filtros.ano}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEnviarEmail = () => {
    alert("Enviar Email - em desenvolvimento");
  };

  return (
    <div>
      <Aviso tipo="erro">{erroDashboard}</Aviso>
      {alerta && <Aviso tipo="erro">{alerta}</Aviso>}

      {/* Filtros */}
      <div className="grid grid-cols-5 gap-3 max-w-4xl mb-5">
        <Campo label="Empresa">
          <Select
            value={filtros.empresa_id}
            onChange={(e) => onFiltroChange({ empresa_id: e.target.value, unidade_id: "", gerente_id: "", vendedor_id: "" })}
          >
            <option value="">…</option>
            {empresas.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo label="Unidade">
          <Select
            value={filtros.unidade_id}
            disabled={!filtros.empresa_id}
            onChange={(e) => onFiltroChange({ unidade_id: e.target.value, gerente_id: "", vendedor_id: "" })}
          >
            <option value="">…</option>
            {unidades.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo label="Gerente">
          <Select
            value={filtros.gerente_id}
            disabled={!filtros.unidade_id}
            onChange={(e) => onFiltroChange({ gerente_id: e.target.value, vendedor_id: "" })}
          >
            <option value="">…</option>
            {gerentes.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo label="Vendedor">
          <Select
            value={filtros.vendedor_id}
            disabled={!filtros.gerente_id}
            onChange={(e) => onFiltroChange({ vendedor_id: e.target.value })}
          >
            <option value="">…</option>
            {vendedores.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo label="Mês / Ano">
          <div className="flex gap-1">
            <Select value={filtros.mes} onChange={(e) => onFiltroChange({ mes: e.target.value })}>
              {MESES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
            <input
              type="number"
              className="w-20 px-2 py-1 border border-gray-300 rounded"
              value={filtros.ano}
              onChange={(e) => onFiltroChange({ ano: e.target.value })}
            />
          </div>
        </Campo>
      </div>

      {/* Dashboard Content */}
      {filtros.vendedor_id && dashboardData && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <KPICard
              label="💰 Meta Total"
              value={`R$ ${dashboardData.resumo.meta_total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              percentual={100}
              color="blue"
            />
            <KPICard
              label="✅ Realizado"
              value={`R$ ${dashboardData.resumo.realizado_total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              percentual={(dashboardData.resumo.realizado_total / dashboardData.resumo.meta_total) * 100}
              color="green"
            />
            <KPICard
              label="📊 % Atingimento"
              value={`${dashboardData.resumo.percentual_atingimento.toFixed(1)}%`}
              percentual={dashboardData.resumo.percentual_atingimento}
              trend={dashboardData.resumo.trend}
              color="purple"
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <BarChartMetasVsRealizado produtos={dashboardData.produtos} />
            <PieChartDistribuicao produtos={dashboardData.produtos} />
          </div>

          {/* Gráfico de Tendência (Full Width) */}
          <div className="mb-6">
            <LineChartTendencia historico={dashboardData.historico_30_dias} />
          </div>

          {/* Comparativo Table */}
          <MetasComparativoTable produtos={dashboardData.produtos} />

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 mb-6">
            <Botao onClick={handleExportarCSV}>📥 Exportar CSV</Botao>
            <Botao onClick={handleEnviarEmail}>📧 Enviar Email</Botao>
            <Botao onClick={() => carregarDashboard(filtros)}>🔄 Atualizar</Botao>
          </div>
        </>
      )}

      {filtros.vendedor_id && loading && (
        <div className="text-center text-gray-500 mt-6 py-8">
          <p>Carregando dados...</p>
        </div>
      )}

      {!filtros.vendedor_id && (
        <div className="text-center text-gray-500 mt-6 py-8">
          <p>Selecione um vendedor para visualizar dados.</p>
        </div>
      )}
    </div>
  );
}
