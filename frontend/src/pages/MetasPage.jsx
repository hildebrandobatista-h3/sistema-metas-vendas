import { useState } from "react";
import { Titulo } from "../components/ui.jsx";
import CadastroMetasGrid from "./Metas/CadastroMetasGrid";

const ANO_ATUAL = new Date().getFullYear();

export default function MetasPage() {
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
      <Titulo sub="Cadastre e gerencie metas de vendas">
        📝 Cadastrar Metas
      </Titulo>

      <CadastroMetasGrid filtros={filtros} onFiltroChange={handleFiltroChange} />
    </div>
  );
}
