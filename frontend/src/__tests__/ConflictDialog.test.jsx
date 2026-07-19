import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConflictDialog from '../components/ConflictDialog'

describe('ConflictDialog', () => {
  const mockConflitos = [
    {
      produto_id: 3,
      produto_nome: 'NREC - (CDU/ADESÃO)',
      periodo_id: 2,
      periodo_nome: 'Fevereiro',
      periodo_ano: 2026,
      meta_atual: '50000.00',
      meta_nova: '50000.00'
    },
    {
      produto_id: 4,
      produto_nome: 'REC - (SMS/SAAS/CLOUD)',
      periodo_id: 3,
      periodo_nome: 'Março',
      periodo_ano: 2026,
      meta_atual: '30000.00',
      meta_nova: '30000.00'
    }
  ]

  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    isOpen: true,
    conflitos: mockConflitos,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza o dialog quando isOpen é true', () => {
    render(<ConflictDialog {...defaultProps} />)
    
    expect(screen.getByText(/Conflitos Detectados/i)).toBeInTheDocument()
    expect(screen.getByText(/Existem metas em conflito/i)).toBeInTheDocument()
  })

  it('não renderiza quando isOpen é false', () => {
    render(<ConflictDialog {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText(/Conflitos Detectados/i)).not.toBeInTheDocument()
  })

  it('exibe todos os conflitos na lista', () => {
    render(<ConflictDialog {...defaultProps} />)
    
    // Primeiro conflito
    expect(screen.getByText(/NREC.*Fevereiro/i)).toBeInTheDocument()
    expect(screen.getByText(/50.000,00/i)).toBeInTheDocument()
    
    // Segundo conflito
    expect(screen.getByText(/REC.*Março/i)).toBeInTheDocument()
  })

  it('mostra número correto de conflitos', () => {
    render(<ConflictDialog {...defaultProps} />)
    
    const conflictItems = screen.getAllByTestId('conflict-item')
    expect(conflictItems).toHaveLength(2)
  })

  it('chama onConfirm ao clicar Sobrescrever Tudo', async () => {
    const user = userEvent.setup()
    render(<ConflictDialog {...defaultProps} />)
    
    const confirmBtn = screen.getByRole('button', { name: /Sobrescrever Tudo/i })
    await user.click(confirmBtn)
    
    expect(mockOnConfirm).toHaveBeenCalledOnce()
  })

  it('chama onCancel ao clicar Cancelar', async () => {
    const user = userEvent.setup()
    render(<ConflictDialog {...defaultProps} />)
    
    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i })
    await user.click(cancelBtn)
    
    expect(mockOnCancel).toHaveBeenCalledOnce()
  })

  it('formata valores monetários corretamente', () => {
    render(<ConflictDialog {...defaultProps} />)
    
    // Verifica se 50000.00 é exibido como 50.000,00 (formato brasileiro)
    expect(screen.getByText(/50\.000,00/i)).toBeInTheDocument()
  })

  it('agrupa conflitos por período', () => {
    render(<ConflictDialog {...defaultProps} />)
    
    // Deve haver seção para Fevereiro e Março
    expect(screen.getByText(/Fevereiro/)).toBeInTheDocument()
    expect(screen.getByText(/Março/)).toBeInTheDocument()
  })

  it('funciona com um único conflito', () => {
    render(
      <ConflictDialog
        isOpen={true}
        conflitos={[mockConflitos[0]]}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )
    
    const conflictItems = screen.getAllByTestId('conflict-item')
    expect(conflictItems).toHaveLength(1)
  })

  it('funciona com muitos conflitos', () => {
    const muitosConflitos = Array(10).fill(null).map((_, i) => ({
      ...mockConflitos[0],
      produto_id: i + 1,
      periodo_id: i + 1,
    }))

    render(
      <ConflictDialog
        isOpen={true}
        conflitos={muitosConflitos}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )
    
    const conflictItems = screen.getAllByTestId('conflict-item')
    expect(conflictItems).toHaveLength(10)
  })

  it('mostra aviso de que valores serão sobrescritos', () => {
    render(<ConflictDialog {...defaultProps} />)
    
    expect(screen.getByText(/serão sobrescritos/i)).toBeInTheDocument()
  })
})
