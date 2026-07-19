import axios from "axios"

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
})

export async function replicarMetas(vendedorId, periodoOrigemId, periodosDestinoIds, sobrescreverConflitos = false) {
  try {
    const response = await apiClient.post("/metas/replicar", {
      vendedor_id: vendedorId,
      periodo_origem_id: periodoOrigemId,
      periodos_destino_ids: periodosDestinoIds,
      sobrescrever_conflitos: sobrescreverConflitos,
    })
    return { status: response.status, data: response.data }
  } catch (error) {
    if (error.response) {
      return { status: error.response.status, data: error.response.data }
    }
    throw error
  }
}

export default apiClient
