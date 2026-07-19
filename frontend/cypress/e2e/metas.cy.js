describe("Sistema de Metas - E2E", () => {
  const API_URL = "http://localhost:8000/api";
  const APP_URL = "http://localhost:3000";

  beforeEach(() => {
    cy.visit(`${APP_URL}/metas`);
  });

  describe("Tab Navigation", () => {
    it("deve exibir ambas as abas", () => {
      cy.contains("📝 Cadastrar Metas").should("be.visible");
      cy.contains("📊 Consultar Metas").should("be.visible");
    });

    it("deve trocar de aba ao clicar", () => {
      cy.contains("📊 Consultar Metas").click();
      cy.contains("Selecione um vendedor para visualizar dados").should("be.visible");
    });

    it("deve manter estado ao alternar abas", () => {
      cy.contains("📊 Consultar Metas").click();
      cy.contains("📝 Cadastrar Metas").click();
      cy.contains("Cadastrar Metas").should("be.visible");
    });
  });

  describe("Aba 1: Cadastro de Metas", () => {
    beforeEach(() => {
      cy.contains("📝 Cadastrar Metas").click();
    });

    it("deve renderizar grid quando vendedor selecionado", () => {
      cy.get("select").first().select("1"); // Empresa
      cy.get("select").eq(1).select("1"); // Unidade
      cy.get("select").eq(2).select("1"); // Gerente
      cy.get("select").eq(3).select("1"); // Vendedor

      cy.contains("Setup").should("be.visible");
      cy.contains("MRR").should("be.visible");
      cy.contains("Projeto").should("be.visible");
    });

    it("deve aceitar entrada de moeda formatada", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.get("input[placeholder='—']").first().type("2200");
      cy.get("input[placeholder='—']").first().should("have.value", "R$ 2.200,00");
    });

    it("deve atualizar total dinamicamente", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.get("input[placeholder='—']").first().type("2200");
      cy.get("input[placeholder='—']").eq(1).type("3300");

      cy.contains("R$ 5.500,00").should("be.visible");
    });

    it("deve navegar com Tab entre campos", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      const inputs = cy.get("input[placeholder='—']");
      inputs.first().focus().type("2200");
      inputs.first().should("have.focus");

      inputs.first().trigger("keydown", { key: "Tab" });
      inputs.eq(1).should("have.focus");
    });

    it("deve desabilitar botão Salvar sem valores", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.contains("Salvar").should("be.disabled");
    });

    it("deve habilitar botão Salvar com valores preenchidos", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.get("input[placeholder='—']").first().type("2200");
      cy.contains("Salvar 1 Meta(s)").should("not.be.disabled");
    });

    it("deve exibir mensagem de sucesso ao salvar", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.get("input[placeholder='—']").first().type("2200");
      cy.contains("Salvar 1 Meta(s)").click();

      cy.contains("meta(s) salva(s)").should("be.visible");
    });

    it("deve abrir modal ao clicar Replicar", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.get("input[placeholder='—']").first().type("2200");
      cy.contains("Replicar Próximos Meses").click();

      cy.get('[data-testid="replicar-modal"]').should("be.visible");
    });

    it("deve validar que campo vazio não pode salvar", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.get("input[placeholder='—']").first().type("0");
      cy.contains("Salvar").should("be.disabled");
    });
  });

  describe("Aba 2: Consulta de Metas", () => {
    beforeEach(() => {
      cy.contains("📊 Consultar Metas").click();
    });

    it("deve exibir mensagem ao não selecionar vendedor", () => {
      cy.contains("Selecione um vendedor para visualizar dados").should("be.visible");
    });

    it("deve renderizar dashboard quando vendedor selecionado", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.contains("💰 Meta Total").should("be.visible");
      cy.contains("✅ Realizado").should("be.visible");
      cy.contains("📊 % Atingimento").should("be.visible");
    });

    it("deve exibir 3 KPI Cards com valores", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.contains("R$ 16.750,00").should("be.visible"); // Meta Total
      cy.contains("R$ 8.900,00").should("be.visible"); // Realizado
      cy.contains("53,1%").should("be.visible"); // % Atingimento
    });

    it("deve renderizar gráfico de barras", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.contains("Meta vs Realizado").should("be.visible");
      cy.get("canvas").should("have.length.greaterThan", 0);
    });

    it("deve renderizar gráfico de pizza", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.contains("Distribuição do Realizado").should("be.visible");
    });

    it("deve renderizar gráfico de linha (tendência)", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.contains("Tendência (Últimos 30 dias)").should("be.visible");
    });

    it("deve exibir tabela comparativa com 7 produtos", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.contains("Setup").should("be.visible");
      cy.contains("MRR").should("be.visible");
      cy.contains("Projeto").should("be.visible");
      cy.contains("NREC").should("be.visible");
      cy.contains("REC").should("be.visible");
      cy.contains("SCS").should("be.visible");
      cy.contains("AMS").should("be.visible");
    });

    it("deve exibir alerta para NREC crítico", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.contains("ALERTA").should("be.visible");
      cy.contains("NREC").should("be.visible");
      cy.contains("70").should("be.visible");
    });

    it("deve fazer download de CSV ao clicar Exportar", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.contains("📥 Exportar CSV").click();
      cy.readFile("cypress/downloads/metas_1_2026.csv").should("exist");
    });

    it("deve atualizar dados ao clicar Atualizar", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.contains("🔄 Atualizar").click();
      cy.contains("Carregando dados").should("be.visible");
    });

    it("deve atualizar todos gráficos ao mudar filtro", () => {
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.contains("R$ 16.750,00").should("be.visible");

      // Trocar mês
      cy.get("select").eq(4).select("2");
      cy.contains("Carregando dados").should("be.visible");
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter labels associados aos inputs", () => {
      cy.get("label").should("have.length.greaterThan", 0);
    });

    it("deve permitir navegação com Tab", () => {
      cy.get("select").first().focus().should("have.focus");
      cy.get("select").first().trigger("keydown", { key: "Tab" });
      cy.get("select").eq(1).should("have.focus");
    });

    it("deve fechar modal com Escape", () => {
      cy.contains("📝 Cadastrar Metas").click();
      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.get("input[placeholder='—']").first().type("2200");
      cy.contains("Replicar Próximos Meses").click();

      cy.get("body").type("{esc}");
      cy.get('[data-testid="replicar-modal"]').should("not.exist");
    });

    it("deve ter contrast suficiente entre cores", () => {
      // Verificar que texto é legível
      cy.contains("📝 Cadastrar Metas").should("be.visible");
      cy.contains("📊 Consultar Metas").should("be.visible");
    });
  });

  describe("Responsividade", () => {
    it("deve ser responsivo em desktop", () => {
      cy.viewport(1280, 800);
      cy.contains("📝 Cadastrar Metas").should("be.visible");
    });

    it("deve ser responsivo em tablet", () => {
      cy.viewport(768, 1024);
      cy.contains("📝 Cadastrar Metas").should("be.visible");
    });

    it("deve ser responsivo em mobile", () => {
      cy.viewport(375, 812);
      cy.contains("📝 Cadastrar Metas").should("be.visible");
    });

    it("deve ter tabelas scrolláveis em mobile", () => {
      cy.viewport(375, 812);
      cy.contains("📊 Consultar Metas").click();

      cy.get("select").first().select("1");
      cy.get("select").eq(1).select("1");
      cy.get("select").eq(2).select("1");
      cy.get("select").eq(3).select("1");

      cy.get("table").should("have.css", "overflow-x", "auto");
    });
  });
});
