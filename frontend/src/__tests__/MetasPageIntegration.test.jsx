import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router-dom"
import MetasPage from "../pages/MetasPage"

// Mock dos serviços
vi.mock("../services/api", () => ({
  listarEmpresas: vi.fn(() => Promise.resolve([{ id: 1, nome: "ASH" }])),
  listarUnidades: vi.fn(() => Promise.resolve([{ id: 1, nome: "TCKS" }])),
  listarGerentes: vi.fn(() => Promise.resolve([{ id: 1, nome: "Hildebrand Batista" }])),
  listarVendedores: vi.fn(() => Promise.resolve([{ id: 1, nome: "Walison Ferreira" }])),
  listarProdutos: vi.fn(() => Promise.resolve([
    { id: 1, nome: "NREC" },
    { id: 2, nome: "REC" },
    { id: 3, nome: "SCS" },
    { id: 4, nome: "AMS" },
  ])),
  listarMetas: vi.fn(() => Promise.resolve([])),
  cadastrarMetasLote: vi.fn(() => Promise.resolve({})),
  replicarMetas: vi.fn(() => Promise.resolve({
    status: 200,
    data: { status: "sucesso", metas_criadas: 40 }
  })),
  msgErro: vi.fn((e) => e?.message || "Erro desconhecido"),
}))

describe("MetasPage - Integração com Replicação", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renderiza página de metas", async () => {
    render(
      <BrowserRouter>
        <MetasPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Cadastrar metas do mês/i)).toBeInTheDocument()
    })
  })

  it("exibe botão Replicar para próximos meses quando vendedor é selecionado", async () => {
    const { listarVendedores } = await import("../services/api")
    listarVendedores.mockResolvedValueOnce([{ id: 1, nome: "Walison Ferreira" }])

    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <MetasPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Cadastrar metas do mês/i)).toBeInTheDocument()
    })

    // Seleciona empresa
    const empresaSelect = screen.getAllByRole("combobox")[0]
    await user.selectOptions(empresaSelect, "1")

    // Espera unidade carregar
    await waitFor(() => {
      const unidadeSelect = screen.getAllByRole("combobox")[1]
      expect(unidadeSelect).not.toBeDisabled()
    })

    // Seleciona unidade
    const unidadeSelect = screen.getAllByRole("combobox")[1]
    await user.selectOptions(unidadeSelect, "1")

    // Espera gerente carregar
    await waitFor(() => {
      const gerenteSelect = screen.getAllByRole("combobox")[2]
      expect(gerenteSelect).not.toBeDisabled()
    })

    // Seleciona gerente
    const gerenteSelect = screen.getAllByRole("combobox")[2]
    await user.selectOptions(gerenteSelect, "1")

    // Espera vendedor carregar
    await waitFor(() => {
      const vendedorSelect = screen.getAllByRole("combobox")[3]
      expect(vendedorSelect).not.toBeDisabled()
    })

    // Seleciona vendedor
    const vendedorSelect = screen.getAllByRole("combobox")[3]
    await user.selectOptions(vendedorSelect, "1")

    // Verifica se botão de replicação aparece
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Replicar para próximos meses/i }))
        .toBeInTheDocument()
    })
  })

  it("abre ReplicarMetasModal ao clicar no botão", async () => {
    const { listarVendedores } = await import("../services/api")
    listarVendedores.mockResolvedValueOnce([{ id: 1, nome: "Walison Ferreira" }])

    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <MetasPage />
      </BrowserRouter>
    )

    // Seleciona vendedor
    await waitFor(() => expect(screen.getByText(/Cadastrar metas do mês/i)).toBeInTheDocument())
    const empresaSelect = screen.getAllByRole("combobox")[0]
    await user.selectOptions(empresaSelect, "1")
    await waitFor(() => expect(screen.getAllByRole("combobox")[1]).not.toBeDisabled())

    const unidadeSelect = screen.getAllByRole("combobox")[1]
    await user.selectOptions(unidadeSelect, "1")
    await waitFor(() => expect(screen.getAllByRole("combobox")[2]).not.toBeDisabled())

    const gerenteSelect = screen.getAllByRole("combobox")[2]
    await user.selectOptions(gerenteSelect, "1")
    await waitFor(() => expect(screen.getAllByRole("combobox")[3]).not.toBeDisabled())

    const vendedorSelect = screen.getAllByRole("combobox")[3]
    await user.selectOptions(vendedorSelect, "1")

    // Clica botão de replicação
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Replicar para próximos meses/i }))
        .toBeInTheDocument()
    })

    const replicateBtn = screen.getByRole("button", { name: /Replicar para próximos meses/i })
    await user.click(replicateBtn)

    // Verifica se modal abriu
    await waitFor(() => {
      expect(screen.getByText("Replicar Metas")).toBeInTheDocument()
    })
  })

  it("fecha modal ao clicar Cancelar", async () => {
    const { listarVendedores } = await import("../services/api")
    listarVendedores.mockResolvedValueOnce([{ id: 1, nome: "Walison Ferreira" }])

    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <MetasPage />
      </BrowserRouter>
    )

    // Seleciona vendedor
    await waitFor(() => expect(screen.getByText(/Cadastrar metas do mês/i)).toBeInTheDocument())
    const selects = screen.getAllByRole("combobox")
    await user.selectOptions(selects[0], "1")
    await waitFor(() => expect(selects[1]).not.toBeDisabled())
    await user.selectOptions(selects[1], "1")
    await waitFor(() => expect(selects[2]).not.toBeDisabled())
    await user.selectOptions(selects[2], "1")
    await waitFor(() => expect(selects[3]).not.toBeDisabled())
    await user.selectOptions(selects[3], "1")

    // Abre modal
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Replicar para próximos meses/i }))
        .toBeInTheDocument()
    })
    await user.click(screen.getByRole("button", { name: /Replicar para próximos meses/i }))

    // Fecha via Cancelar
    await waitFor(() => {
      expect(screen.getByText("Replicar Metas")).toBeInTheDocument()
    })

    const cancelBtn = screen.getAllByRole("button", { name: /Cancelar/i })[0]
    await user.click(cancelBtn)

    await waitFor(() => {
      expect(screen.queryByText("Replicar Metas")).not.toBeInTheDocument()
    })
  })

  it("chama replicarMetas quando modal é confirmado", async () => {
    const { listarVendedores, replicarMetas } = await import("../services/api")
    listarVendedores.mockResolvedValueOnce([{ id: 1, nome: "Walison Ferreira" }])

    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <MetasPage />
      </BrowserRouter>
    )

    // Seleciona vendedor
    await waitFor(() => expect(screen.getByText(/Cadastrar metas do mês/i)).toBeInTheDocument())
    const selects = screen.getAllByRole("combobox")
    await user.selectOptions(selects[0], "1")
    await waitFor(() => expect(selects[1]).not.toBeDisabled())
    await user.selectOptions(selects[1], "1")
    await waitFor(() => expect(selects[2]).not.toBeDisabled())
    await user.selectOptions(selects[2], "1")
    await waitFor(() => expect(selects[3]).not.toBeDisabled())
    await user.selectOptions(selects[3], "1")

    // Abre e usa modal
    await waitFor(() => expect(screen.getByRole("button", { name: /Replicar para próximos meses/i })).toBeInTheDocument())
    await user.click(screen.getByRole("button", { name: /Replicar para próximos meses/i }))

    // Seleciona Fevereiro
    await waitFor(() => expect(screen.getByLabelText("Fevereiro")).toBeInTheDocument())
    await user.click(screen.getByLabelText("Fevereiro"))

    // Clica "Replicar Metas" do modal
    const modalButtons = screen.getAllByRole("button", { name: /Replicar Metas/i })
    const replicateModalBtn = modalButtons.find(btn => btn.textContent.includes("Replicar"))
    await user.click(replicateModalBtn)

    // Verifica se replicarMetas foi chamado
    await waitFor(() => {
      expect(replicarMetas).toHaveBeenCalled()
    })
  })

  it("mostra dialog de conflitos quando API retorna 202", async () => {
    const { listarVendedores, replicarMetas } = await import("../services/api")
    listarVendedores.mockResolvedValueOnce([{ id: 1, nome: "Walison Ferreira" }])

    replicarMetas.mockResolvedValueOnce({
      status: 202,
      data: {
        status: "conflitos_detectados",
        conflitos: [
          {
            produto_id: 1,
            produto_nome: "NREC",
            periodo_id: 2,
            periodo_nome: "Fevereiro",
            meta_atual: "50000.00",
            meta_nova: "50000.00"
          }
        ]
      }
    })

    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <MetasPage />
      </BrowserRouter>
    )

    // Seleciona vendedor
    await waitFor(() => expect(screen.getByText(/Cadastrar metas do mês/i)).toBeInTheDocument())
    const selects = screen.getAllByRole("combobox")
    await user.selectOptions(selects[0], "1")
    await waitFor(() => expect(selects[1]).not.toBeDisabled())
    await user.selectOptions(selects[1], "1")
    await waitFor(() => expect(selects[2]).not.toBeDisabled())
    await user.selectOptions(selects[2], "1")
    await waitFor(() => expect(selects[3]).not.toBeDisabled())
    await user.selectOptions(selects[3], "1")

    // Abre e usa modal
    await waitFor(() => expect(screen.getByRole("button", { name: /Replicar para próximos meses/i })).toBeInTheDocument())
    await user.click(screen.getByRole("button", { name: /Replicar para próximos meses/i }))

    await waitFor(() => expect(screen.getByLabelText("Fevereiro")).toBeInTheDocument())
    await user.click(screen.getByLabelText("Fevereiro"))

    const modalButtons = screen.getAllByRole("button", { name: /Replicar Metas/i })
    const replicateModalBtn = modalButtons.find(btn => btn.textContent.includes("Replicar"))
    await user.click(replicateModalBtn)

    // Deve mostrar dialog de conflitos
    await waitFor(() => {
      expect(screen.getByText(/Conflitos Detectados/i)).toBeInTheDocument()
    })
  })

  it("chama replicarMetas com sobrescrever_conflitos=true ao confirmar no dialog", async () => {
    const { listarVendedores, replicarMetas } = await import("../services/api")
    listarVendedores.mockResolvedValueOnce([{ id: 1, nome: "Walison Ferreira" }])

    replicarMetas.mockResolvedValueOnce({
      status: 202,
      data: {
        status: "conflitos_detectados",
        conflitos: [{ produto_id: 1, produto_nome: "NREC", periodo_id: 2, periodo_nome: "Fevereiro" }]
      }
    })

    replicarMetas.mockResolvedValueOnce({
      status: 200,
      data: { status: "sucesso", metas_criadas: 4 }
    })

    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <MetasPage />
      </BrowserRouter>
    )

    // Seleciona vendedor
    await waitFor(() => expect(screen.getByText(/Cadastrar metas do mês/i)).toBeInTheDocument())
    const selects = screen.getAllByRole("combobox")
    await user.selectOptions(selects[0], "1")
    await waitFor(() => expect(selects[1]).not.toBeDisabled())
    await user.selectOptions(selects[1], "1")
    await waitFor(() => expect(selects[2]).not.toBeDisabled())
    await user.selectOptions(selects[2], "1")
    await waitFor(() => expect(selects[3]).not.toBeDisabled())
    await user.selectOptions(selects[3], "1")

    // Abre e usa modal
    await waitFor(() => expect(screen.getByRole("button", { name: /Replicar para próximos meses/i })).toBeInTheDocument())
    await user.click(screen.getByRole("button", { name: /Replicar para próximos meses/i }))

    await waitFor(() => expect(screen.getByLabelText("Fevereiro")).toBeInTheDocument())
    await user.click(screen.getByLabelText("Fevereiro"))

    const modalButtons = screen.getAllByRole("button", { name: /Replicar Metas/i })
    const replicateModalBtn = modalButtons.find(btn => btn.textContent.includes("Replicar"))
    await user.click(replicateModalBtn)

    // Aguarda dialog
    await waitFor(() => {
      expect(screen.getByText(/Conflitos Detectados/i)).toBeInTheDocument()
    })

    // Clica "Sobrescrever Tudo"
    const confirmBtn = screen.getByRole("button", { name: /Sobrescrever Tudo/i })
    await user.click(confirmBtn)

    // Verifica segunda chamada com sobrescrever_conflitos: true
    await waitFor(() => {
      const calls = replicarMetas.mock.calls
      const lastCall = calls[calls.length - 1]
      expect(lastCall[3]).toBe(true) // sobrescrever_conflitos = true
    })
  })
})
