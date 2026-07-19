import { useState } from "react";
import { Titulo } from "../components/ui.jsx";
import CadastroMetasGrid from "./Metas/CadastroMetasGrid";
import ConsultaMetasDashboard from "./Metas/ConsultaMetasDashboard";

const ANO_ATUAL = new Date().getFullYear();

export default function MetasPage() {
  const [activeTab, setActiveTab] = useState("cadastro");
  const [filtros, setFiltros] = useState({
    empresa_id: "",
    unidade_id: "",
    gerente_id: "",
    vendedor_id: "",
    ano: String(ANO_ATUAL),
    mes: String(new Date().getMonth() + 1),
  });

  const handleFiltroChange = (novosFiltros) => {
    setFiltros((prev) => ({ ...prev, ...novosFiltros }));
  };

  return (
    <div>
      <Titulo sub="Gerencie as metas de vendas: cadastro e consulta">
        📊 Metas
      </Titulo>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "cadastro"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("cadastro")}
        >
          📝 Cadastrar Metas
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "consulta"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("consulta")}
        >
          📊 Consultar Metas
        </button>
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="tab-content">
        {activeTab === "cadastro" && (
          <CadastroMetasGrid filtros={filtros} onFiltroChange={handleFiltroChange} />
        )}
        {activeTab === "consulta" && (
          <ConsultaMetasDashboard filtros={filtros} onFiltroChange={handleFiltroChange} />
        )}
      </div>
    </div>
  );
}
