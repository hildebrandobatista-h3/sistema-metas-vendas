import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReplicarMetasModal from '../components/ReplicarMetasModal'

describe('ReplicarMetasModal', () => {
  const mockOnClose = vi.fn()
  const mockOnReplicate = vi.fn()

  const defaultProps = {
    isOpen: true,
    vendedorId: 1,
    periodoOrigemId: 1,
    onClose: mockOnClose,
    onReplicate: mockOnReplicate,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza o modal quando isOpen é true', () => {
    render(<ReplicarMetasModal {...defaultProps} />)
    
    expect(screen.getByText('Replicar Metas')).toBeInTheDocument()
    expect(screen.getByText(/Origem:/i)).toBeInTheDocument()
  })

  it('não renderiza quando isOpen é false', () => {
    render(<ReplicarMetasModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Replicar Metas')).not.toBeInTheDocument()
  })

  it('fecha o modal ao clicar no botão X', async () => {
    const user = userEvent.setup()
    render(<ReplicarMetasModal {...defaultProps} />)
    
    const closeButton = screen.getByRole('button', { name: /✕/i })
    await user.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it('exibe todos os 11 meses (Fevereiro até Dezembro)', () => {
    render(<ReplicarMetasModal {...defaultProps} />)
    
    expect(screen.getByLabelText('Fevereiro')).toBeInTheDocument()
    expect(screen.getByLabelText('Março')).toBeInTheDocument()
    expect(screen.getByLabelText('Dezembro')).toBeInTheDocument()
  })

  it('atualiza contagem de meses selecionados quando checkbox muda', async () => {
    const user = userEvent.setup()
    render(<ReplicarMetasModal {...defaultProps} />)
    
    const fevCheckbox = screen.getByLabelText('Fevereiro')
    await user.click(fevCheckbox)
    
    expect(fevCheckbox).toBeChecked()
    expect(screen.getByText(/Meses selecionados:\s*1/)).toBeInTheDocument()
  })

  it('seleciona todos os meses ao clicar Selecionar Tudo', async () => {
    const user = userEvent.setup()
    render(<ReplicarMetasModal {...defaultProps} />)
    
    const selectAllBtn = screen.getByRole('button', { name: /Selecionar Tudo/i })
    await user.click(selectAllBtn)
    
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked()
    })
  })

  it('seleciona apenas Semestre 1 (Fevereiro a Junho)', async () => {
    const user = userEvent.setup()
    render(<ReplicarMetasModal {...defaultProps} />)
    
    const semestre1Btn = screen.getByRole('button', { name: /Semestre 1/i })
    await user.click(semestre1Btn)
    
    expect(screen.getByLabelText('Fevereiro')).toBeChecked()
    expect(screen.getByLabelText('Junho')).toBeChecked()
    expect(screen.getByLabelText('Julho')).not.toBeChecked()
  })

  it('seleciona apenas Semestre 2 (Julho a Dezembro)', async () => {
    const user = userEvent.setup()
    render(<ReplicarMetasModal {...defaultProps} />)
    
    const semestre2Btn = screen.getByRole('button', { name: /Semestre 2/i })
    await user.click(semestre2Btn)
    
    expect(screen.getByLabelText('Julho')).toBeChecked()
    expect(screen.getByLabelText('Dezembro')).toBeChecked()
    expect(screen.getByLabelText('Junho')).not.toBeChecked()
  })

  it('limpa todas as seleções ao clicar Limpar', async () => {
    const user = userEvent.setup()
    render(<ReplicarMetasModal {...defaultProps} />)
    
    // Seleciona tudo
    await user.click(screen.getByRole('button', { name: /Selecionar Tudo/i }))
    
    // Clica limpar
    await user.click(screen.getByRole('button', { name: /Limpar/i }))
    
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(checkbox => {
      expect(checkbox).not.toBeChecked()
    })
  })

  it('desabilita botão Replicar Metas quando nenhum mês é selecionado', () => {
    render(<ReplicarMetasModal {...defaultProps} />)
    
    const replicateBtn = screen.getByRole('button', { name: /Replicar Metas/i })
    expect(replicateBtn).toBeDisabled()
  })

  it('habilita botão Replicar Metas quando pelo menos 1 mês é selecionado', async () => {
    const user = userEvent.setup()
    render(<ReplicarMetasModal {...defaultProps} />)
    
    const fevCheckbox = screen.getByLabelText('Fevereiro')
    await user.click(fevCheckbox)
    
    const replicateBtn = screen.getByRole('button', { name: /Replicar Metas/i })
    expect(replicateBtn).not.toBeDisabled()
  })

  it('calcula total de metas corretamente (meses × 4 produtos)', async () => {
    const user = userEvent.setup()
    render(<ReplicarMetasModal {...defaultProps} />)
    
    // Seleciona 3 meses
    await user.click(screen.getByLabelText('Fevereiro'))
    await user.click(screen.getByLabelText('Março'))
    await user.click(screen.getByLabelText('Abril'))
    
    // Deve mostrar 3 × 4 = 12 metas
    expect(screen.getByText(/Total de metas a processar:\s*12 metas/)).toBeInTheDocument()
  })

  it('chama onReplicate com periodos selecionados ao clicar Replicar Metas', async () => {
    const user = userEvent.setup()
    render(<ReplicarMetasModal {...defaultProps} />)
    
    // Seleciona Fevereiro (ID 2) e Março (ID 3)
    await user.click(screen.getByLabelText('Fevereiro'))
    await user.click(screen.getByLabelText('Março'))
    
    const replicateBtn = screen.getByRole('button', { name: /Replicar Metas/i })
    await user.click(replicateBtn)
    
    expect(mockOnReplicate).toHaveBeenCalledWith({
      periodos_destino_ids: [2, 3], // Fevereiro e Março
    })
  })

  it('fecha modal ao clicar Cancelar', async () => {
    const user = userEvent.setup()
    render(<ReplicarMetasModal {...defaultProps} />)
    
    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i })
    await user.click(cancelBtn)
    
    expect(mockOnClose).toHaveBeenCalledOnce()
  })
})
