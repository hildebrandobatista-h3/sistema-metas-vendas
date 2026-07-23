import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ProductBreakdownCard from "../components/ProductBreakdownCard.jsx";
import * as api from "../services/api.js";

vi.mock("../services/api.js", () => ({
  buscarBreakdownProdutos: vi.fn(),
}));

const filtrosPadrao = {
  ano: 2026,
  periodo_tipo: "mensal",
  periodo_ref: 7,
};

const dadosFicticios = {
  produtos: [
    { produto_id: 1, produto_nome: "Setup", meta_total: "1500.00", realizado_total: "1100.00", percentual: 73.3 },
    { produto_id: 2, produto_nome: "MRR", meta_total: "2000.00", realizado_total: "0.00", percentual: 0.0 },
    { produto_id: 3, produto_nome: "Projeto", meta_total: "0.00", realizado_total: "0.00", percentual: 0.0 },
  ],
};

describe("ProductBreakdownCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza lista de produtos com dados", async () => {
    api.buscarBreakdownProdutos.mockResolvedValue(dadosFicticios);
    render(<ProductBreakdownCard filtros={filtrosPadrao} />);

    await waitFor(() => {
      expect(screen.getByText("Setup")).toBeInTheDocument();
      expect(screen.getByText("MRR")).toBeInTheDocument();
    });
    expect(screen.getByText("73.3%")).toBeInTheDocument();
    expect(screen.getByText("Breakdown por produto")).toBeInTheDocument();
  });

  it("produtos sem meta/realizado aparecem com visual desabilitado (opacity)", async () => {
    api.buscarBreakdownProdutos.mockResolvedValue(dadosFicticios);
    const { container } = render(<ProductBreakdownCard filtros={filtrosPadrao} />);

    await waitFor(() => expect(screen.getByText("Projeto")).toBeInTheDocument());

    const projetoRow = screen.getByText("Projeto").closest("div");
    expect(projetoRow).toHaveStyle({ opacity: "0.4" });
  });

  it("exibe mensagem de erro quando API falha", async () => {
    api.buscarBreakdownProdutos.mockRejectedValue(new Error("network error"));
    render(<ProductBreakdownCard filtros={filtrosPadrao} />);

    await waitFor(() =>
      expect(screen.getByText(/não foi possível carregar/i)).toBeInTheDocument()
    );
  });
});
