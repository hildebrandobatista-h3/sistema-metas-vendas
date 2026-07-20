import { useState, useEffect } from "react";
import { Titulo, Campo, Input, Select, Botao, Aviso, moeda } from "../components/ui.jsx";
import {
  listarEmpresas, listarUnidades, listarGerentes, listarVendedores,
  listarProdutos, lancarRealizado, listarRealizado, msgErro,
} from "../services/api.js";

const MESES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

export default function RealizadoPage() {
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [gerentes, setGerentes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
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
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mostrarAuditoria, setMostrarAuditoria] = useState(false);

  useEffect(() => { listarEmpresas().then(setEmpresas).catch(() => {}); listarProdutos().then(setProdutos).catch(() => {}); }, []);
  useEffect(() => { setUnidades([]); setGerentes([]); setVendedores([]); setSel(s => ({ ...s, unidade:"", gerente:"", vendedor:"" }));
    if (sel.empresa) listarUnidades(sel.empresa).then(setUnidades).catch(() => {}); }, [sel.empresa]);
  useEffect(() => { setGerentes([]); setVendedores([]); setSel(s => ({ ...s, gerente:"", vendedor:"" }));
    if (sel.unidade) listarGerentes(sel.unidade).then(setGerentes).catch(() => {}); }, [sel.unidade]);
  useEffect(() => { setVendedores([]); setSel(s => ({ ...s, vendedor:"" }));
    if (sel.gerente) listarVendedores(sel.gerente).then(setVendedores).catch(() => {}); }, [sel.gerente]);

  function carregarLancamentos(vendId, dataRef) {
    if (!vendId || !dataRef) return;
    const d = new Date(dataRef + "T00:00:00");
    listarRealizado({ vendedor_id: vendId, ano: d.getFullYear(), mes: d.getMonth() + 1 })
      .then(setLancamentos).catch(() => setLancamentos([]));
  }
  useEffect(() => { if (sel.vendedor && form.data_venda) carregarLancamentos(sel.vendedor, form.data_venda); }, [sel.vendedor, form.data_venda]);

  async function salvar() {
    setErro(""); setOk("");
    if (!sel.empresa || !sel.unidade || !sel.gerente || !sel.vendedor || !form.produto_id || !form.data_venda || !form.valor) {
      setErro("Preencha empresa, unidade, gerente, vendedor, produto, data e valor."); return;
    }
    setSalvando(true);
    try {
      await lancarRealizado({
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
      });
      setOk("Lançamento salvo."); setForm(f => ({ ...f, produto_id:"", valor:"", descricao:"", cnpj:"", codigo_cliente:"", razao_social:"", nome_fantasia:"", numero_oportunidade:"", numero_proposta:"" }));
      carregarLancamentos(sel.vendedor, form.data_venda);
    } catch (e) { setErro(msgErro(e)); } finally { setSalvando(false); }
  }

  const mesLabel = form.data_venda ? MESES[new Date(form.data_venda + "T00:00:00").getMonth()] : "";

  return (
    <div>
      <Titulo sub="Registre uma venda efetivada. A data define o mês de competência.">Lançar realizado</Titulo>
      <Aviso tipo="erro">{erro}</Aviso>
      <Aviso tipo="info">{ok}</Aviso>

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
              <option value="">Outro período...</option>
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

      {/* SEÇÃO 5: AUDITORIA (Colapsável) */}
      <div style={{ marginBottom: "24px", padding: "12px", background: "#f9fafb", border: "0.5px solid #e5e7eb", borderRadius: "8px" }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", width: "100%" }}
          onClick={() => setMostrarAuditoria(!mostrarAuditoria)}>
          <span style={{ fontSize: "12px" }}>{mostrarAuditoria ? "▼" : "▶"}</span>
          <span>🔒 Auditoria (Automático)</span>
        </button>
        {mostrarAuditoria && (
          <div style={{ marginTop: "12px", fontSize: "11px", color: "#626c7d" }}>
            <div><strong>Origem:</strong> manual / nectar</div>
            <div><strong>Status:</strong> Ativo</div>
            <div><strong>Criado em:</strong> YYYY-MM-DD HH:MM:SS (automático)</div>
            <div><strong>Atualizado em:</strong> YYYY-MM-DD HH:MM:SS (automático)</div>
            <div><strong>Criado por:</strong> Usuário autenticado</div>
          </div>
        )}
      </div>

      {/* BOTÕES */}
      <div className="flex gap-3 mt-5">
        <Botao onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : "Salvar lançamento"}</Botao>
        <Botao variant="secondary" onClick={() => setForm({ produto_id:"", data_venda: form.data_venda, valor:"", descricao:"", cnpj:"", codigo_cliente:"", razao_social:"", nome_fantasia:"", numero_oportunidade:"", numero_proposta:"", periodo_id:"" })}>Limpar</Botao>
      </div>

      {/* TABELA DE LANÇAMENTOS */}
      {lancamentos.length > 0 && (
        <div style={{ marginTop: "28px", borderTop: "0.5px solid #e5e7eb", paddingTop: "16px" }}>
          <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>Lançamentos de {mesLabel}</p>
          {lancamentos.map(l => {
            const prod = produtos.find(p => p.id === l.produto_id);
            const d = new Date(l.data_venda + "T00:00:00");
            return (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", paddingY: "6px", borderBottom: "0.5px solid #e5e7eb", fontSize: "13px" }}>
                <span>{prod?.nome} · {String(d.getDate()).padStart(2,"0")}/{String(d.getMonth()+1).padStart(2,"0")}</span>
                <span style={{ fontWeight: "600" }}>{moeda(l.valor)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
