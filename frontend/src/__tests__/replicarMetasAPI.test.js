import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// Mock do axios
vi.mock('axios')

// Função que será testada (será implementada em services/api.js)
async function replicarMetas(vendedorId, periodoOrigemId, periodosDestinoIds, sobrescreverConflitos = false) {
  try {
    const response = await axios.post('/api/metas/replicar', {
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

describe('replicarMetas API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('faz POST request para /api/metas/replicar com dados corretos', async () => {
    axios.post.mockResolvedValue({
      status: 200,
      data: { status: 'sucesso', metas_criadas: 40 }
    })

    await replicarMetas(1, 1, [2, 3, 4, 5, 6], false)

    expect(axios.post).toHaveBeenCalledWith(
      '/api/metas/replicar',
      {
        vendedor_id: 1,
        periodo_origem_id: 1,
        periodos_destino_ids: [2, 3, 4, 5, 6],
        sobrescrever_conflitos: false,
      }
    )
  })

  it('retorna status 200 e dados quando replicação é bem-sucedida', async () => {
    const mockData = {
      status: 'sucesso',
      mensagem: 'Metas replicadas com sucesso',
      metas_criadas: 40,
      metas_atualizadas: 0,
      total_processadas: 40,
      conflitos: []
    }

    axios.post.mockResolvedValue({ status: 200, data: mockData })

    const result = await replicarMetas(1, 1, [2, 3, 4, 5, 6])

    expect(result.status).toBe(200)
    expect(result.data.status).toBe('sucesso')
    expect(result.data.metas_criadas).toBe(40)
  })

  it('retorna status 202 quando há conflitos', async () => {
    const mockData = {
      status: 'conflitos_detectados',
      mensagem: '3 conflitos encontrados',
      metas_criadas: 8,
      total_processadas: 11,
      conflitos: [
        {
          produto_id: 3,
          produto_nome: 'NREC - (CDU/ADESÃO)',
          periodo_id: 2,
          periodo_nome: 'Fevereiro',
          periodo_ano: 2026,
          meta_atual: '50000.00',
          meta_nova: '50000.00'
        }
      ]
    }

    axios.post.mockResolvedValue({ status: 202, data: mockData })

    const result = await replicarMetas(1, 1, [2, 3, 4, 5, 6], false)

    expect(result.status).toBe(202)
    expect(result.data.status).toBe('conflitos_detectados')
    expect(result.data.conflitos).toHaveLength(1)
    expect(result.data.conflitos[0].produto_nome).toBe('NREC - (CDU/ADESÃO)')
  })

  it('retorna status 202 com múltiplos conflitos', async () => {
    const mockData = {
      status: 'conflitos_detectados',
      mensagem: '5 conflitos encontrados',
      conflitos: [
        { produto_nome: 'NREC', periodo_nome: 'Fevereiro', meta_atual: 50000, meta_nova: 50000 },
        { produto_nome: 'REC', periodo_nome: 'Fevereiro', meta_atual: 30000, meta_nova: 30000 },
        { produto_nome: 'NREC', periodo_nome: 'Março', meta_atual: 50000, meta_nova: 50000 },
        { produto_nome: 'SCS', periodo_nome: 'Abril', meta_atual: 20000, meta_nova: 20000 },
        { produto_nome: 'AMS', periodo_nome: 'Maio', meta_atual: 15000, meta_nova: 15000 },
      ]
    }

    axios.post.mockResolvedValue({ status: 202, data: mockData })

    const result = await replicarMetas(1, 1, [2, 3, 4, 5, 6], false)

    expect(result.data.conflitos).toHaveLength(5)
  })

  it('envia sobrescrever_conflitos como true quando solicitado', async () => {
    axios.post.mockResolvedValue({
      status: 200,
      data: { status: 'sucesso', metas_atualizadas: 3 }
    })

    await replicarMetas(1, 1, [2, 3], true)

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ sobrescrever_conflitos: true })
    )
  })

  it('retorna 404 quando período não existe', async () => {
    const errorData = { detail: 'Período origem ID 999 não encontrado' }
    axios.post.mockRejectedValue({
      response: { status: 404, data: errorData }
    })

    const result = await replicarMetas(1, 999, [2, 3])

    expect(result.status).toBe(404)
  })

  it('retorna 403 quando usuário não tem permissão', async () => {
    const errorData = { detail: 'Você só pode replicar metas de seus vendedores' }
    axios.post.mockRejectedValue({
      response: { status: 403, data: errorData }
    })

    const result = await replicarMetas(1, 1, [2, 3])

    expect(result.status).toBe(403)
  })

  it('retorna 400 quando dados estão inválidos', async () => {
    const errorData = { detail: 'periodos_destino_ids não pode estar vazio' }
    axios.post.mockRejectedValue({
      response: { status: 400, data: errorData }
    })

    const result = await replicarMetas(1, 1, [])

    expect(result.status).toBe(400)
  })

  it('após resolver conflito, faz nova chamada com sobrescrever_conflitos=true', async () => {
    // Primeira chamada retorna conflitos
    axios.post.mockResolvedValueOnce({
      status: 202,
      data: {
        status: 'conflitos_detectados',
        conflitos: [{ produto_nome: 'NREC' }]
      }
    })

    // Segunda chamada (com sobrescrita) retorna sucesso
    axios.post.mockResolvedValueOnce({
      status: 200,
      data: {
        status: 'sucesso',
        metas_atualizadas: 1
      }
    })

    const result1 = await replicarMetas(1, 1, [2, 3], false)
    expect(result1.status).toBe(202)

    const result2 = await replicarMetas(1, 1, [2, 3], true)
    expect(result2.status).toBe(200)

    expect(axios.post).toHaveBeenCalledTimes(2)
  })
})
