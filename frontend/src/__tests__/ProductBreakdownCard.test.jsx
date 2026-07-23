import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

// Mock do módulo de API antes de importar o componente
vi.mock('../services/api.js', () => ({
  buscarBreakdownProdutos: vi.fn(),
}))

// Mock do zustand auth store
vi.mock('../store/auth.js', () => ({
  useAuthStore: vi.fn(),
}))

import ProductBreakdownCard from '../components/ProductBreakdownCard.jsx'
import { buscarBreakdownProdutos } from '../services/api.js'
import { useAuthStore } from '../store/auth.js'

const FILTROS_BASE = { ano: '2026', tipo: 'mensal', ref: '7', empresa: '', unidade: '', gerente: '', vendedor: '' }

const DADOS_MOCK = {
  ano: 2026, periodo_tipo: 'mensal', periodo_ref: 7, meses: [7],
  produtos: [
    { produto_id: 1, produto_nome: 'Produto A', meta: '10000.00', realizado: '7500.00', percentual: 75.0 },
  ],
}

describe('ProductBreakdownCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exibe tabela com dados quando API retorna sucesso', async () => {
    buscarBreakdownProdutos.mockResolvedValue(DADOS_MOCK)
    render(<ProductBreakdownCard filtros={FILTROS_BASE} />)
    await waitFor(() => expect(screen.getByText('Produto A')).toBeInTheDocument())
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('exibe mensagem quando não há dados', async () => {
    buscarBreakdownProdutos.mockResolvedValue({ ...DADOS_MOCK, produtos: [] })
    render(<ProductBreakdownCard filtros={FILTROS_BASE} />)
    await waitFor(() => expect(screen.getByText(/sem dados/i)).toBeInTheDocument())
  })

  it('exibe mensagem de erro quando API falha', async () => {
    buscarBreakdownProdutos.mockRejectedValue(new Error('network error'))
    render(<ProductBreakdownCard filtros={FILTROS_BASE} />)
    await waitFor(() => expect(screen.getByText(/não foi possível/i)).toBeInTheDocument())
  })
})

// Testes de visibilidade condicional em DashboardPage
vi.mock('../services/api.js', () => ({
  buscarBreakdownProdutos: vi.fn().mockResolvedValue({ ano: 2026, periodo_tipo: 'mensal', periodo_ref: 7, meses: [7], produtos: [] }),
  buscarDashboard: vi.fn().mockResolvedValue({ ano: 2026, periodo_tipo: 'mensal', periodo_ref: 7, meses: [7], meta_total: 0, realizado_total: 0, percentual_total: 0, linhas: [] }),
  listarEmpresas: vi.fn().mockResolvedValue([]),
  listarProdutos: vi.fn().mockResolvedValue([]),
  listarUnidades: vi.fn().mockResolvedValue([]),
  listarGerentes: vi.fn().mockResolvedValue([]),
  listarVendedores: vi.fn().mockResolvedValue([]),
}))

import DashboardPage from '../pages/DashboardPage.jsx'

describe('DashboardPage — controle de acesso ao ProductBreakdownCard', () => {
  it('vendedor NÃO vê ProductBreakdownCard', async () => {
    useAuthStore.mockReturnValue({ perfil: 'vendedor' })
    const { queryByText } = render(<DashboardPage />)
    // Aguarda carregamento (dados retornam imediatamente com mock)
    await waitFor(() => {})
    expect(queryByText('Breakdown por produto')).not.toBeInTheDocument()
  })

  it('gerente VÊ ProductBreakdownCard', async () => {
    useAuthStore.mockReturnValue({ perfil: 'gerente' })
    render(<DashboardPage />)
    await waitFor(() => expect(screen.queryByText('Breakdown por produto')).toBeInTheDocument())
  })

  it('admin VÊ ProductBreakdownCard', async () => {
    useAuthStore.mockReturnValue({ perfil: 'admin' })
    render(<DashboardPage />)
    await waitFor(() => expect(screen.queryByText('Breakdown por produto')).toBeInTheDocument())
  })
})
