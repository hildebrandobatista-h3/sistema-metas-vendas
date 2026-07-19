import { useState } from "react"

const MESES = [
  { id: 2, label: "Fevereiro" },
  { id: 3, label: "Março" },
  { id: 4, label: "Abril" },
  { id: 5, label: "Maio" },
  { id: 6, label: "Junho" },
  { id: 7, label: "Julho" },
  { id: 8, label: "Agosto" },
  { id: 9, label: "Setembro" },
  { id: 10, label: "Outubro" },
  { id: 11, label: "Novembro" },
  { id: 12, label: "Dezembro" },
]

const SEMESTRE_1 = [2, 3, 4, 5, 6]
const SEMESTRE_2 = [7, 8, 9, 10, 11, 12]

export default function ReplicarMetasModal({ isOpen, vendedorId, periodoOrigemId, onClose, onReplicate }) {
  const [selecionados, setSelecionados] = useState(new Set())

  if (!isOpen) return null

  const toggleMes = (id) => {
    const novo = new Set(selecionados)
    if (novo.has(id)) {
      novo.delete(id)
    } else {
      novo.add(id)
    }
    setSelecionados(novo)
  }

  const selecionarTudo = () => {
    setSelecionados(new Set(MESES.map(m => m.id)))
  }

  const selecionarSemestre1 = () => {
    setSelecionados(new Set(SEMESTRE_1))
  }

  const selecionarSemestre2 = () => {
    setSelecionados(new Set(SEMESTRE_2))
  }

  const limpar = () => {
    setSelecionados(new Set())
  }

  const totalMetas = selecionados.size * 4

  const handleReplicate = () => {
    if (selecionados.size > 0) {
      onReplicate({
        periodos_destino_ids: Array.from(selecionados).sort((a, b) => a - b),
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold">Replicar Metas</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            aria-label="✕"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-sm text-gray-600 space-y-1">
            <p>Origem: Período {periodoOrigemId}</p>
            <p>Vendedor: ID {vendedorId}</p>
          </div>

          <div className="bg-blue-50 p-3 rounded text-sm space-y-1">
            <p>Meses selecionados: {selecionados.size}</p>
            <p>Total de metas a processar: {totalMetas} metas</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={selecionarTudo}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Selecionar Tudo
            </button>
            <button
              onClick={selecionarSemestre1}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Semestre 1
            </button>
            <button
              onClick={selecionarSemestre2}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Semestre 2
            </button>
            <button
              onClick={limpar}
              className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
            >
              Limpar
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto border-t pt-4">
            {MESES.map((mes) => (
              <label key={mes.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selecionados.has(mes.id)}
                  onChange={() => toggleMes(mes.id)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{mes.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 p-5 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleReplicate}
            disabled={selecionados.size === 0}
            aria-label="Replicar Metas"
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Replicar
          </button>
        </div>
      </div>
    </div>
  )
}
