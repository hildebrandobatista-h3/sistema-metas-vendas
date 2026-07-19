export default function ConflictDialog({ isOpen, conflitos = [], onConfirm, onCancel }) {
  if (!isOpen) return null

  const formatarMoeda = (valor) => {
    const num = parseFloat(String(valor).replace(",", "."))
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  const conflitosAgrupados = conflitos.reduce((acc, conflito) => {
    const key = `${conflito.periodo_id}-${conflito.periodo_nome}`
    if (!acc[key]) {
      acc[key] = {
        periodo_nome: conflito.periodo_nome,
        items: []
      }
    }
    acc[key].items.push(conflito)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-red-600">Conflitos Detectados</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-700">
            Existem metas em conflito nos períodos de destino. As metas atuais serão sobrescritos pelos valores de origem.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800">
            <span>Total de conflitos: {conflitos.length}</span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto border-t pt-4">
            {Object.entries(conflitosAgrupados).map(([periodo, periodo_data]) => (
              <div key={periodo} className="space-y-2">
                {periodo_data.items.map((conflito, idx) => (
                  <div
                    key={`${conflito.produto_id}-${conflito.periodo_id}-${idx}`}
                    data-testid="conflict-item"
                    className="bg-gray-50 p-2 rounded border-l-4 border-orange-300 pl-3"
                  >
                    <p className="font-medium text-gray-800">
                      {conflito.produto_nome} - {conflito.periodo_nome}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatarMoeda(conflito.meta_atual)} → {formatarMoeda(conflito.meta_nova)}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 p-5 border-t bg-gray-50">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            aria-label="Sobrescrever Tudo"
          >
            Sobrescrever Tudo
          </button>
        </div>
      </div>
    </div>
  )
}
