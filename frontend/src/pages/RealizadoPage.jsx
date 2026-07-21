import { useState, useEffect } from "react";
import { Titulo, Campo, Input, Select, Botao, Aviso, moeda } from "../components/ui.jsx";
import {
  listarEmpresas, listarUnidades, listarGerentes, listarVendedores,
  listarProdutos, lancarRealizado, listarRealizado, msgErro,
} from "../services/api.js";
import api from "../services/api.js";

const MESES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

export default function RealizadoPage() {
  const [activeTab, setActiveTab] = useState("lancar");

  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [gerentes, setGerentes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [vendedoresCompleto, setVendedoresCompleto] = useState([]);
  const [gerentesCompleto, setGerentesCompleto] = useState([]);
  const [unidadesCompleto, setUnidadesCompleto] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [sel, setSel] = useState({ empresa: "", unidade: "", gerente: "", vendedor: "" });

  const [form, setForm] = useState({
    produto_id: "",
    data_venda: new Date().toISOString().split('T')[0],
    valor: "",
    descricao: "",
    cnpj: "",
    codigo_cliente: "",
    razao_social: "",
    nome_fantasia: "",
    numero_oportunidade: "",
    numero_proposta: "",
    periodo_id: "",
  });
  const [lancamentos, setLancamentos] = useState([]);
  const [lancamentosConsulta, setLancamentosConsulta] = useState([]);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mostrarAuditoria, setMostrarAuditoria] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [detalhesModal, setDetalhesModal] = useState(null);

  // ABA: OPORTUNIDADES CRM
  const [oportunidades, setOportunidades] = useState([]);
  const [sincronizandoCRM, setSincronizandoCRM] = useState(false);
  const [erroCRM, setErroCRM] = useState("");
  const [okCRM, setOkCRM] = useState("");
  const [carregandoOportunidades, setCarregandoOportunidades] = useState(false);

  // Filtros de consulta
  const [filtros, setFiltros] = useState({
    dataInicio: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    gerente: "",
    status: "ativo",
    busca: "",
  });

  useEffect(() => { listarEmpresas().then(setEmpresas).catch(() => {}); listarProdutos().then(setProdutos).catch(() => {}); }, []);
  useEffect(() => {
    listarVendedores().then(setVendedoresCompleto).catch(() => {});
    listarGerentes().then(setGerentesCompleto).catch(() => {});
    listarUnidades().then(setUnidadesCompleto).catch(() => {});
  }, []);
  useEffect(() => { setUnidades([]); setGerentes([]); setVendedores([]); setSel(s => ({ ...s, unidade:"", gerente:"", vendedor:"" }));
    if (sel.empresa) listarUnidades(sel.empresa).then(setUnidades).catch(() => {}); }, [sel.empresa]);
  useEffect(() => { setGerentes([]); setVendedores([]); setSel(s => ({ ...s, gerente:"", vendedor:"" }));
    if (sel.unidade) listarGerentes(sel.unidade).then(setGerentes).catch(() => {}); }, [sel.unidade]);
  useEffect(() => { setVendedores([]); setSel(s => ({ ...s, vendedor:"" }));
    if (sel.gerente) listarVendedores(sel.gerente).then(setVendedores).catch(() => {}); }, [sel.gerente]);

  // Carrega oportunidades quando aba de CRM é ativada
  useEffect(() => {
    if (activeTab === "oportunidades") {
      carregarOportunidades();
    }
  }, [activeTab]);

  async function carregarOportunidades() {
    setCarregandoOportunidades(true);
    setErroCRM("");
    try {
      const res = await api.get("/sincronizacao/oportunidades");
      setOportunidades(res.data || []);
    } catch (e) {
      setErroCRM(msgErro(e));
      setOportunidades([]);
    } finally {
      setCarregandoOportunidades(false);
    }
  }

  async function dispararSincronizacao() {
    setSincronizandoCRM(true);
    setErroCRM("");
    setOkCRM("");
    try {
      await api.post("/sincronizacao/sincronizar");
      setOkCRM("Sincronização iniciada com sucesso!");
      // Aguarda 3 segundos e recarrega
      setTimeout(() => {
        carregarOportunidades();
      }, 3000);
    } catch (e) {
      setErroCRM(msgErro(e));
    } finally {
      setSincronizandoCRM(false);
    }
  }

  async function mapear(id) {
    setErroCRM("");
    setOkCRM("");
    try {
      await api.post(`/sincronizacao/oportunidades/${id}/mapear`);
      setOkCRM("Oportunidade mapeada para realizado com sucesso!");
      carregarOportunidades();
    } catch (e) {
      setErroCRM(msgErro(e));
    }
  }

  async function ignorar(id) {
    setErroCRM("");
    setOkCRM("");
    try {
      await api.delete(`/sincronizacao/oportunidades/${id}`);
      setOkCRM("Oportunidade marcada como ignorada.");
      carregarOportunidades();
    } catch (e) {
      setErroCRM(msgErro(e));
    }
  }

  function carregarLancamentos(vendId, dataRef) {
    if (!vendId || !dataRef) return;
    const d = new Date(dataRef + "T00:00:00");
    listarRealizado({ vendedor_id: vendId, ano: d.getFullYear(), mes: d.getMonth() + 1 })
      .then(setLancamentos).catch(() => setLancamentos([]));
  }
  useEffect(() => { if (sel.vendedor && form.data_venda) carregarLancamentos(sel.vendedor, form.data_venda); }, [sel.vendedor, form.data_venda]);

  function aplicarFiltros() {
    listarRealizado({
      vendedor_id: sel.vendedor || undefined,
      ano: new Date(filtros.dataInicio + "T00:00:00").getFullYear(),
      mes: undefined,
      incluir_inativos: filtros.status === "todos"
    })
    .then(l => {
      let filtered = l.filter(x => {
        const d = new Date(x.data_venda + "T00:00:00");
        const ini = new Date(filtros.dataInicio + "T00:00:00");
        const fim = new Date(filtros.dataFim + "T00:00:00");
        const dentroData = d >= ini && d <= fim;
        const dentroGerente = !filtros.gerente || x.gerente_id == filtros.gerente;
        const dentroStatus = filtros.status === "ativo" ? x.ativo : filtros.status === "inativo" ? !x.ativo : true;
        const dentoBusca = !filtros.busca ||
          x.razao_social?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
          x.cnpj?.includes(filtros.busca) ||
          x.codigo_cliente?.toLowerCase().includes(filtros.busca.toLowerCase());
        return dentroData && dentroGerente && dentroStatus && dentoBusca;
      });
      setLancamentosConsulta(filtered);
    })
    .catch(() => setLancamentosConsulta([]));
  }

  function calcularResumo() {
    const total = lancamentosConsulta.reduce((sum, l) => sum + parseFloat(l.valor), 0);
    return {
      qtde: lancamentosConsulta.length,
      total: total,
      media: lancamentosConsulta.length > 0 ? total / lancamentosConsulta.length : 0,
      maior: lancamentosConsulta.length > 0 ? Math.max(...lancamentosConsulta.map(l => parseFloat(l.valor))) : 0,
    };
  }

  async function salvar() {
    setErro(""); setOk("");
    if (!sel.empresa || !sel.unidade || !sel.gerente || !sel.vendedor || !form.produto_id || !form.data_venda || !form.valor) {
      setErro("Preencha empresa, unidade, gerente, vendedor, produto, data e valor."); return;
    }
    setSalvando(true);
    try {
      const payload = {
        vendedor_id: Number(sel.vendedor),
        produto_id: Number(form.produto_id),
        empresa_id: Number(sel.empresa),
        unidade_id: Number(sel.unidade),
        gerente_id: Number(sel.gerente),
        data_venda: form.data_venda,
        valor: form.valor,
        descricao: form.descricao || null,
        cnpj: form.cnpj || null,
        codigo_cliente: form.codigo_cliente || null,
        razao_social: form.razao_social || null,
        nome_fantasia: form.nome_fantasia || null,
        numero_oportunidade: form.numero_oportunidade || null,
        numero_proposta: form.numero_proposta || null,
        periodo_id: form.periodo_id ? Number(form.periodo_id) : null,
      };

      if (editandoId) {
        await api.patch(`/realizado/${editandoId}`, payload);
        setOk("Lançamento atualizado."); setEditandoId(null);
      } else {
        await lancarRealizado(payload);
        setOk("Lançamento salvo.");
      }

      setForm(f => ({ ...f, produto_id:"", valor:"", descricao:"", cnpj:"", codigo_cliente:"", razao_social:"", nome_fantasia:"", numero_oportunidade:"", numero_proposta:"" }));
      carregarLancamentos(sel.vendedor, form.data_venda);
    } catch (e) { setErro(msgErro(e)); } finally { setSalvando(false); }
  }

  function editar(realizado) {
    setEditandoId(realizado.id);
    setSel({ empresa: realizado.empresa_id, unidade: realizado.unidade_id, gerente: realizado.gerente_id, vendedor: realizado.vendedor_id });
    setForm({
      produto_id: realizado.produto_id,
      data_venda: realizado.data_venda,
      valor: realizado.valor,
      descricao: realizado.descricao || "",
      cnpj: realizado.cnpj || "",
      codigo_cliente: realizado.codigo_cliente || "",
      razao_social: realizado.razao_social || "",
      nome_fantasia: realizado.nome_fantasia || "",
      numero_oportunidade: realizado.numero_oportunidade || "",
      numero_proposta: realizado.numero_proposta || "",
      periodo_id: realizado.periodo_id || "",
    });
    setActiveTab("lancar");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deletar(id) {
    if (!confirm("Tem certeza que deseja deletar este lançamento?")) return;
    try {
      await api.delete(`/realizado/${id}`);
      setOk("Lançamento deletado.");
      aplicarFiltros();
      carregarLancamentos(sel.vendedor, form.data_venda);
    } catch (e) { setErro(msgErro(e)); }
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(f => ({ ...f, produto_id:"", valor:"", descricao:"", cnpj:"", codigo_cliente:"", razao_social:"", nome_fantasia:"", numero_oportunidade:"", numero_proposta:"" }));
  }

  const mesLabel = form.data_venda ? MESES[new Date(form.data_venda + "T00:00:00").getMonth()] : "";
  const resumo = calcularResumo();

  return (
    <div>
      <Titulo>Realizado</Titulo>

      {/* ABAS */}
      <div style={{ display: "flex", gap: "16px", borderBottom: "0.5px solid #e5e7eb", marginBottom: "24px", overflowX: "auto" }}>
        <button
          onClick={() => setActiveTab("lancar")}
          style={{
            padding: "12px 0",
            border: "none",
            background: "none",
            borderBottom: activeTab === "lancar" ? "2px solid #0369a1" : "none",
            color: activeTab === "lancar" ? "#0369a1" : "#626c7d",
            fontWeight: activeTab === "lancar" ? "600" : "400",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap"
          }}
        >
          📝 Lançar realizado
        </button>
        <button
          onClick={() => { setActiveTab("consultar"); aplicarFiltros(); }}
          style={{
            padding: "12px 0",
            border: "none",
            background: "none",
            borderBottom: activeTab === "consultar" ? "2px solid #0369a1" : "none",
            color: activeTab === "consultar" ? "#0369a1" : "#626c7d",
            fontWeight: activeTab === "consultar" ? "600" : "400",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap"
          }}
        >
          🔍 Consultar realizado
        </button>
        <button
          onClick={() => setActiveTab("oportunidades")}
          style={{
            padding: "12px 0",
            border: "none",
            background: "none",
            borderBottom: activeTab === "oportunidades" ? "2px solid #0369a1" : "none",
            color: activeTab === "oportunidades" ? "#0369a1" : "#626c7d",
            fontWeight: activeTab === "oportunidades" ? "600" : "400",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap"
          }}
        >
          🚀 Oportunidades CRM
        </button>
      </div>

      {/* ABA: LANÇAR */}
      {activeTab === "lancar" && (
        <div>
          <Aviso tipo="erro">{erro}</Aviso>
          <Aviso tipo="info">{ok}</Aviso>

          {editandoId && <Aviso tipo="info">✏️ Modo edição - ID {editandoId}</Aviso>}

          {/* SEÇÃO 1: DADOS DE CONTEXTO */}
          <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "0.5px solid #e5e7eb" }}>
            <div style={{ fontSize: "13px", fontWeight: "500", marginBottom: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
              <span>🏢 Dados de Contexto</span>
              <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "3px", fontSize: "11px", fontWeight: "500" }}>Obrigatório</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Empresa">
                <Select value={sel.empresa} onChange={e => setSel(s => ({ ...s, empresa: e.target.value }))}>
                  <option value="">Selecione…</option>
                  {empresas.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
                </Select>
              </Campo>
              <Campo label="Unidade">
                <Select value={sel.unidade} disabled={!sel.empresa} onChange={e => setSel(s => ({ ...s, unidade: e.target.value }))}>
                  <option value="">Selecione…</option>
                  {unidades.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
                </Select>
              </Campo>
              <Campo label="Gerente">
                <Select value={sel.gerente} disabled={!sel.unidade} onChange={e => setSel(s => ({ ...s, gerente: e.target.value }))}>
                  <option value="">Selecione…</option>
                  {gerentes.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
                </Select>
              </Campo>
              <Campo label="Vendedor">
                <Select value={sel.vendedor} disabled={!sel.gerente} onChange={e => setSel(s => ({ ...s, vendedor: e.target.value }))}>
                  <option value="">Selecione…</option>
                  {vendedores.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
                </Select>
              </Campo>
            </div>
          </div>

          {/* SEÇÃO 2: DADOS DA VENDA */}
          <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "0.5px solid #e5e7eb" }}>
            <div style={{ fontSize: "13px", fontWeight: "500", marginBottom: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
              <span>📋 Dados da Venda</span>
              <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "3px", fontSize: "11px", fontWeight: "500" }}>Obrigatório</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Produto">
                <Select value={form.produto_id} onChange={e => setForm(f => ({ ...f, produto_id: e.target.value }))}>
                  <option value="">Selecione…</option>
                  {produtos.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
                </Select>
              </Campo>
              <Campo label="Data da venda">
                <Input type="date" value={form.data_venda} onChange={e => setForm(f => ({ ...f, data_venda: e.target.value }))} />
              </Campo>
              <Campo label="Valor">
                <Input type="number" step="0.01" min="0" placeholder="0,00" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} />
              </Campo>
              <Campo label="Período">
                <Select value={form.periodo_id} onChange={e => setForm(f => ({ ...f, periodo_id: e.target.value }))}>
                  <option value="">Auto (baseado na data)</option>
                </Select>
              </Campo>
            </div>
            <div style={{ marginTop: "12px" }}>
              <Campo label="Descrição" opcional>
                <Input placeholder="contrato mensal cliente XPTO" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
              </Campo>
            </div>
          </div>

          {/* SEÇÃO 3: DADOS DO CLIENTE */}
          <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "0.5px solid #e5e7eb" }}>
            <div style={{ fontSize: "13px", fontWeight: "500", marginBottom: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
              <span>👤 Dados do Cliente</span>
              <span style={{ background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "3px", fontSize: "11px", fontWeight: "500" }}>Opcional</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="CNPJ">
                <Input placeholder="00.000.000/0000-00" value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} />
              </Campo>
              <Campo label="Código do Cliente">
                <Input placeholder="CLI-001" value={form.codigo_cliente} onChange={e => setForm(f => ({ ...f, codigo_cliente: e.target.value }))} />
              </Campo>
              <Campo label="Razão Social">
                <Input placeholder="Empresa LTDA" value={form.razao_social} onChange={e => setForm(f => ({ ...f, razao_social: e.target.value }))} />
              </Campo>
              <Campo label="Nome Fantasia">
                <Input placeholder="Marca" value={form.nome_fantasia} onChange={e => setForm(f => ({ ...f, nome_fantasia: e.target.value }))} />
              </Campo>
            </div>
          </div>

          {/* SEÇÃO 4: RASTREABILIDADE */}
          <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "0.5px solid #e5e7eb" }}>
            <div style={{ fontSize: "13px", fontWeight: "500", marginBottom: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
              <span>📊 Rastreabilidade</span>
              <span style={{ background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "3px", fontSize: "11px", fontWeight: "500" }}>Opcional</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Número de Oportunidade">
                <Input placeholder="CRM ID" maxLength="10" value={form.numero_oportunidade} onChange={e => setForm(f => ({ ...f, numero_oportunidade: e.target.value }))} />
              </Campo>
              <Campo label="Número de Proposta">
                <Input placeholder="Proposta ID" maxLength="10" value={form.numero_proposta} onChange={e => setForm(f => ({ ...f, numero_proposta: e.target.value }))} />
              </Campo>
            </div>
          </div>

          {/* BOTÕES */}
          <div className="flex gap-3 mt-5">
            <Botao onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : editandoId ? "Atualizar lançamento" : "Salvar lançamento"}</Botao>
            <Botao variant="secondary" onClick={() => editandoId ? cancelarEdicao() : setForm({ produto_id:"", data_venda: form.data_venda, valor:"", descricao:"", cnpj:"", codigo_cliente:"", razao_social:"", nome_fantasia:"", numero_oportunidade:"", numero_proposta:"", periodo_id:"" })}>{editandoId ? "Cancelar edição" : "Limpar"}</Botao>
          </div>

          {/* TABELA DO MÊS */}
          {lancamentos.length > 0 && (
            <div style={{ marginTop: "28px", borderTop: "0.5px solid #e5e7eb", paddingTop: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>Lançamentos de {mesLabel}</p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb" }}>
                      <th style={{ padding: "8px", textAlign: "left", fontWeight: "500" }}>Produto</th>
                      <th style={{ padding: "8px", textAlign: "right", fontWeight: "500" }}>Valor</th>
                      <th style={{ padding: "8px", textAlign: "center", fontWeight: "500" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lancamentos.map(l => {
                      const prod = produtos.find(p => p.id === l.produto_id);
                      const d = new Date(l.data_venda + "T00:00:00");
                      return (
                        <tr key={l.id} style={{ borderBottom: "0.5px solid #e5e7eb" }}>
                          <td style={{ padding: "8px" }}>{prod?.nome} · {String(d.getDate()).padStart(2,"0")}/{String(d.getMonth()+1).padStart(2,"0")}</td>
                          <td style={{ padding: "8px", textAlign: "right", fontWeight: "600" }}>{moeda(l.valor)}</td>
                          <td style={{ padding: "8px", textAlign: "center", display: "flex", gap: "6px", justifyContent: "center" }}>
                            <button onClick={() => editar(l)} style={{ background: "#dbeafe", color: "#0369a1", border: "0.5px solid #0369a1", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>
                              ✏️ Editar
                            </button>
                            <button onClick={() => deletar(l.id)} style={{ background: "#fee2e2", color: "#dc2626", border: "0.5px solid #dc2626", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>
                              🗑️ Deletar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA: CONSULTAR */}
      {activeTab === "consultar" && (
        <div>
          <Aviso tipo="erro">{erro}</Aviso>
          <Aviso tipo="info">{ok}</Aviso>

          {/* FILTROS */}
          <div style={{ background: "#f9fafb", padding: "16px", borderRadius: "8px", border: "0.5px solid #e5e7eb", marginBottom: "24px" }}>
            <div style={{ fontSize: "13px", fontWeight: "500", marginBottom: "12px" }}>Filtros</div>
            <div className="grid grid-cols-3 gap-4">
              <Campo label="Período (início)">
                <Input type="date" value={filtros.dataInicio} onChange={e => setFiltros(f => ({ ...f, dataInicio: e.target.value }))} />
              </Campo>
              <Campo label="Período (fim)">
                <Input type="date" value={filtros.dataFim} onChange={e => setFiltros(f => ({ ...f, dataFim: e.target.value }))} />
              </Campo>
              <Campo label="Status">
                <Select value={filtros.status} onChange={e => setFiltros(f => ({ ...f, status: e.target.value }))}>
                  <option value="ativo">Ativos</option>
                  <option value="inativo">Inativos</option>
                  <option value="todos">Todos</option>
                </Select>
              </Campo>
              <Campo label="Gerente">
                <Select value={filtros.gerente} onChange={e => setFiltros(f => ({ ...f, gerente: e.target.value }))}>
                  <option value="">Todos</option>
                  {gerentes.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
                </Select>
              </Campo>
              <Campo label="Buscar (cliente/CNPJ)">
                <Input type="text" placeholder="Nome ou CNPJ" value={filtros.busca} onChange={e => setFiltros(f => ({ ...f, busca: e.target.value }))} />
              </Campo>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <Botao onClick={aplicarFiltros}>🔍 Filtrar</Botao>
              </div>
            </div>
          </div>

          {/* RESUMO */}
          {lancamentosConsulta.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
              <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "8px", border: "0.5px solid #bbf7d0" }}>
                <div style={{ fontSize: "11px", color: "#15803d", marginBottom: "4px" }}>Total de lançamentos</div>
                <div style={{ fontSize: "18px", fontWeight: "600", color: "#166534" }}>{resumo.qtde}</div>
              </div>
              <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "8px", border: "0.5px solid #bbf7d0" }}>
                <div style={{ fontSize: "11px", color: "#15803d", marginBottom: "4px" }}>Valor total</div>
                <div style={{ fontSize: "18px", fontWeight: "600", color: "#166534" }}>{moeda(resumo.total)}</div>
              </div>
              <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "8px", border: "0.5px solid #bbf7d0" }}>
                <div style={{ fontSize: "11px", color: "#15803d", marginBottom: "4px" }}>Ticket médio</div>
                <div style={{ fontSize: "18px", fontWeight: "600", color: "#166534" }}>{moeda(resumo.media)}</div>
              </div>
              <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "8px", border: "0.5px solid #bbf7d0" }}>
                <div style={{ fontSize: "11px", color: "#15803d", marginBottom: "4px" }}>Maior venda</div>
                <div style={{ fontSize: "18px", fontWeight: "600", color: "#166534" }}>{moeda(resumo.maior)}</div>
              </div>
            </div>
          )}

          {/* TABELA COMPLETA */}
          {lancamentosConsulta.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb" }}>
                    <th style={{ padding: "8px", textAlign: "left", fontWeight: "500" }}>Produto</th>
                    <th style={{ padding: "8px", textAlign: "left", fontWeight: "500" }}>Data</th>
                    <th style={{ padding: "8px", textAlign: "left", fontWeight: "500" }}>Vendedor</th>
                    <th style={{ padding: "8px", textAlign: "left", fontWeight: "500" }}>Gerente</th>
                    <th style={{ padding: "8px", textAlign: "left", fontWeight: "500" }}>Unidade</th>
                    <th style={{ padding: "8px", textAlign: "left", fontWeight: "500" }}>Cliente</th>
                    <th style={{ padding: "8px", textAlign: "right", fontWeight: "500" }}>Valor</th>
                    <th style={{ padding: "8px", textAlign: "center", fontWeight: "500" }}>Status</th>
                    <th style={{ padding: "8px", textAlign: "center", fontWeight: "500" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lancamentosConsulta.map(l => {
                    const prod = produtos.find(p => p.id === l.produto_id);
                    const d = new Date(l.data_venda + "T00:00:00");
                    return (
                      <tr key={l.id} style={{ borderBottom: "0.5px solid #e5e7eb" }}>
                        <td style={{ padding: "8px" }}>{prod?.nome}</td>
                        <td style={{ padding: "8px" }}>{String(d.getDate()).padStart(2,"0")}/{String(d.getMonth()+1).padStart(2,"0")}/{d.getFullYear()}</td>
                        <td style={{ padding: "8px" }}>{vendedoresCompleto.find(v => v.id === l.vendedor_id)?.nome || "—"}</td>
                        <td style={{ padding: "8px" }}>{gerentesCompleto.find(g => g.id === l.gerente_id)?.nome || "—"}</td>
                        <td style={{ padding: "8px" }}>{unidadesCompleto.find(u => u.id === l.unidade_id)?.nome || "—"}</td>
                        <td style={{ padding: "8px" }}>{l.razao_social || "N/A"}</td>
                        <td style={{ padding: "8px", textAlign: "right", fontWeight: "600" }}>{moeda(l.valor)}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "3px", fontSize: "11px", fontWeight: "500", background: l.ativo ? "#dcfce7" : "#fee2e2", color: l.ativo ? "#166534" : "#991b1b" }}>
                            {l.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td style={{ padding: "8px", textAlign: "center", display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button onClick={() => setDetalhesModal(l)} style={{ background: "#dbeafe", color: "#0369a1", border: "0.5px solid #0369a1", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>
                            👁️ Ver
                          </button>
                          <button onClick={() => editar(l)} disabled={!l.ativo} style={{ background: l.ativo ? "#dbeafe" : "#f3f4f6", color: l.ativo ? "#0369a1" : "#9ca3af", border: "0.5px solid " + (l.ativo ? "#0369a1" : "#d1d5db"), padding: "4px 10px", borderRadius: "4px", cursor: l.ativo ? "pointer" : "not-allowed", fontSize: "12px", fontWeight: "500" }}>
                            ✏️ Editar
                          </button>
                          <button onClick={() => deletar(l.id)} disabled={!l.ativo} style={{ background: l.ativo ? "#fee2e2" : "#f3f4f6", color: l.ativo ? "#dc2626" : "#9ca3af", border: "0.5px solid " + (l.ativo ? "#dc2626" : "#d1d5db"), padding: "4px 10px", borderRadius: "4px", cursor: l.ativo ? "pointer" : "not-allowed", fontSize: "12px", fontWeight: "500" }}>
                            🗑️ Deletar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
              Nenhum lançamento encontrado com os filtros aplicados.
            </div>
          )}
        </div>
      )}

      {/* ABA: OPORTUNIDADES CRM */}
      {activeTab === "oportunidades" && (
        <div>
          <Aviso tipo="erro">{erroCRM}</Aviso>
          <Aviso tipo="info">{okCRM}</Aviso>

          {/* BOTÃO DE SINCRONIZAÇÃO */}
          <div style={{ marginBottom: "24px" }}>
            <Botao onClick={dispararSincronizacao} disabled={sincronizandoCRM}>
              {sincronizandoCRM ? "Sincronizando…" : "🔄 Disparar sincronização"}
            </Botao>
          </div>

          {/* TABELA DE OPORTUNIDADES */}
          {carregandoOportunidades ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
              Carregando oportunidades…
            </div>
          ) : oportunidades.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb" }}>
                    <th style={{ padding: "8px", textAlign: "left", fontWeight: "500" }}>Vendedor</th>
                    <th style={{ padding: "8px", textAlign: "left", fontWeight: "500" }}>Gerente</th>
                    <th style={{ padding: "8px", textAlign: "left", fontWeight: "500" }}>Unidade</th>
                    <th style={{ padding: "8px", textAlign: "left", fontWeight: "500" }}>Cliente</th>
                    <th style={{ padding: "8px", textAlign: "left", fontWeight: "500" }}>Oportunidade</th>
                    <th style={{ padding: "8px", textAlign: "right", fontWeight: "500" }}>Valor</th>
                    <th style={{ padding: "8px", textAlign: "center", fontWeight: "500" }}>Status</th>
                    <th style={{ padding: "8px", textAlign: "center", fontWeight: "500" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {oportunidades.map(opp => (
                    <tr key={opp.id} style={{ borderBottom: "0.5px solid #e5e7eb" }}>
                      <td style={{ padding: "8px" }}>{opp.cliente}</td>
                      <td style={{ padding: "8px" }}>{opp.nome}</td>
                      <td style={{ padding: "8px", textAlign: "right", fontWeight: "600" }}>{moeda(opp.valor)}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "3px",
                          fontSize: "11px",
                          fontWeight: "500",
                          background:
                            opp.status_sincronizacao === "pendente" ? "#fef3c7" :
                            opp.status_sincronizacao === "mapeado" ? "#dcfce7" :
                            "#fee2e2",
                          color:
                            opp.status_sincronizacao === "pendente" ? "#b45309" :
                            opp.status_sincronizacao === "mapeado" ? "#166534" :
                            "#991b1b"
                        }}>
                          {opp.status_sincronizacao}
                        </span>
                      </td>
                      <td style={{ padding: "8px", textAlign: "center", display: "flex", gap: "6px", justifyContent: "center" }}>
                        {opp.status_sincronizacao === "pendente" && (
                          <>
                            <button
                              onClick={() => mapear(opp.id)}
                              style={{
                                background: "#dcfce7",
                                color: "#166534",
                                border: "0.5px solid #bbf7d0",
                                padding: "4px 10px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "500"
                              }}
                            >
                              ✅ Mapear
                            </button>
                            <button
                              onClick={() => ignorar(opp.id)}
                              style={{
                                background: "#fee2e2",
                                color: "#991b1b",
                                border: "0.5px solid #fecaca",
                                padding: "4px 10px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "500"
                              }}
                            >
                              ❌ Ignorar
                            </button>
                          </>
                        )}
                        {opp.status_sincronizacao === "mapeado" && (
                          <span style={{ fontSize: "12px", color: "#166534" }}>✓ Convertida</span>
                        )}
                        {opp.status_sincronizacao === "ignorado" && (
                          <span style={{ fontSize: "12px", color: "#991b1b" }}>— Ignorada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
              Nenhuma oportunidade sincronizada. Clique em "Disparar sincronização" para buscar oportunidades do NectarCRM.
            </div>
          )}
        </div>
      )}

      {/* MODAL DE DETALHES */}
      {detalhesModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#ffffff", borderRadius: "12px", border: "0.5px solid #e5e7eb", padding: "24px", maxWidth: "500px", width: "90%", maxHeight: "80vh", overflowY: "auto" }}>
            <button onClick={() => setDetalhesModal(null)} style={{ float: "right", background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#9ca3af" }}>✕</button>
            <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "500" }}>Detalhes do Lançamento</h2>

            <div style={{ marginBottom: "16px" }}>
              <h3 style={{ fontSize: "12px", color: "#9ca3af", textTransform: "uppercase", fontWeight: "500", margin: "0 0 8px" }}>Dados da Venda</h3>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #e5e7eb" }}>
                <label style={{ fontSize: "12px", color: "#9ca3af" }}>Produto</label>
                <span style={{ fontWeight: "500" }}>{produtos.find(p => p.id === detalhesModal.produto_id)?.nome}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #e5e7eb" }}>
                <label style={{ fontSize: "12px", color: "#9ca3af" }}>Data</label>
                <span style={{ fontWeight: "500" }}>{new Date(detalhesModal.data_venda + "T00:00:00").toLocaleDateString('pt-BR')}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #e5e7eb" }}>
                <label style={{ fontSize: "12px", color: "#9ca3af" }}>Valor</label>
                <span style={{ fontWeight: "500" }}>{moeda(detalhesModal.valor)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <label style={{ fontSize: "12px", color: "#9ca3af" }}>Descrição</label>
                <span style={{ fontWeight: "500" }}>{detalhesModal.descricao || "—"}</span>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <h3 style={{ fontSize: "12px", color: "#9ca3af", textTransform: "uppercase", fontWeight: "500", margin: "0 0 8px" }}>Dados do Cliente</h3>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #e5e7eb" }}>
                <label style={{ fontSize: "12px", color: "#9ca3af" }}>CNPJ</label>
                <span style={{ fontWeight: "500" }}>{detalhesModal.cnpj || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #e5e7eb" }}>
                <label style={{ fontSize: "12px", color: "#9ca3af" }}>Razão Social</label>
                <span style={{ fontWeight: "500" }}>{detalhesModal.razao_social || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #e5e7eb" }}>
                <label style={{ fontSize: "12px", color: "#9ca3af" }}>Nome Fantasia</label>
                <span style={{ fontWeight: "500" }}>{detalhesModal.nome_fantasia || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <label style={{ fontSize: "12px", color: "#9ca3af" }}>Código Cliente</label>
                <span style={{ fontWeight: "500" }}>{detalhesModal.codigo_cliente || "—"}</span>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <h3 style={{ fontSize: "12px", color: "#9ca3af", textTransform: "uppercase", fontWeight: "500", margin: "0 0 8px" }}>Rastreabilidade</h3>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #e5e7eb" }}>
                <label style={{ fontSize: "12px", color: "#9ca3af" }}>N. Oportunidade</label>
                <span style={{ fontWeight: "500" }}>{detalhesModal.numero_oportunidade || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <label style={{ fontSize: "12px", color: "#9ca3af" }}>N. Proposta</label>
                <span style={{ fontWeight: "500" }}>{detalhesModal.numero_proposta || "—"}</span>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "12px", color: "#9ca3af", textTransform: "uppercase", fontWeight: "500", margin: "0 0 8px" }}>Auditoria</h3>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #e5e7eb" }}>
                <label style={{ fontSize: "12px", color: "#9ca3af" }}>Criado em</label>
                <span style={{ fontWeight: "500" }}>{new Date(detalhesModal.criado_em).toLocaleString('pt-BR')}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <label style={{ fontSize: "12px", color: "#9ca3af" }}>Status</label>
                <span style={{ fontWeight: "500" }}>{detalhesModal.ativo ? "Ativo" : "Inativo"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
