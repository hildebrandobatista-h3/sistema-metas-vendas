export default function MetasComparativoTable({ produtos }) {
  const getStatusIcon = (status) => {
    if (status === "success") return "🟢";
    if (status === "warning") return "🟡";
    if (status === "danger") return "🔴";
    return "⚪";
  };

  const getStatusColor = (status) => {
    if (status === "success") return "text-green-600";
    if (status === "warning") return "text-yellow-600";
    if (status === "danger") return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Produto</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Meta</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Realizado</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">%</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Variação</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto, idx) => (
              <tr key={produto.produto_id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3 text-gray-900">{produto.nome}</td>
                <td className="px-4 py-3 text-right text-gray-700">
                  R$ {produto.meta.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </td>
                <td className="px-4 py-3 text-right text-gray-700 font-medium">
                  R$ {produto.realizado.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </td>
                <td className="px-4 py-3 text-right font-semibold">{produto.percentual.toFixed(1)}%</td>
                <td className={`px-4 py-3 text-center ${getStatusColor(produto.status)}`}>
                  {getStatusIcon(produto.status)}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${produto.variacao < 0 ? "text-red-600" : "text-green-600"}`}>
                  {produto.variacao > 0 ? "+" : ""}{produto.variacao.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
