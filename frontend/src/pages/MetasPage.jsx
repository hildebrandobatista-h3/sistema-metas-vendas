import { useState, useEffect } from "react";
import { Titulo, Campo, Input, Select, Botao, Aviso } from "../components/ui.jsx";
import {
  listarEmpresas, listarUnidades, listarGerentes, listarVendedores,
  listarProdutos, cadastrarMetasLote, listarMetas, msgErro,
} from "../services/api.js";

const ANO_ATUAL = new Date().getFullYear();
const MESES = [["1","Jan"],["2","Fev"],["3","Mar"],["4","Abr"],["5","Mai"],["6","Jun"],
  ["7","Jul"],["8","Ago"],["9","Set"],["10","Out"],["11","Nov"],["12","Dez"]];

export default function MetasPage() {
  const [empresas, setEmpresas] = useState([]); const [unidades, setUnidades] = useState([]);
  const [gerentes, setGerentes] = useState([]); const [vendedores, setVendedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [sel, setSel] = useState({ empresa:"", unidade:"", gerente:"", vendedor:"" });
  const [ano, setAno] = useState(String(ANO_ATUAL)); const [mes, setMes] = useState(String(new Date().getMonth()+1));
  const [valores, setValores] = useState({});
  const [erro, setErro] = useState(""); const [ok, setOk] = useState(""); const [salvando, setSalvando] = useState(false);

  useEffect(() => { listarEmpresas().then(setEmpresas).catch(() => {}); listarProdutos().then(setProdutos).catch(() => {}); }, []);
  useEffect(() => { setUnidades([]); setSel(s => ({...s, unidade:"", gerente:"", vendedor:""})); if (sel.empresa) listarUnidades(sel.empresa).then(setUnidades).catch(() => {}); }, [sel.empresa]);
  useEffect(() => { setGerentes([]); setSel(s => ({...s, gerente:"", vendedor:""})); if (sel.unidade) listarGerentes(sel.unidade).then(setGerentes).catch(() => {}); }, [sel.unidade]);
  useEffect(() => { setVendedores([]); setSel(s => ({...s, vendedor:""})); if (sel.gerente) listarVendedores(sel.gerente).then(setVendedores).catch(() => {}); }, [sel.gerente]);

  useEffect(() => {
    if (!sel.vendedor || !ano || !mes) return;
    listarMetas({ vendedor_id: sel.vendedor, ano: Number(ano), mes: Number(mes) })
      .then(ms => { const v = {}; ms.forEach(m => { v[m.produto_id] = String(m.valor); }); setValores(v); })
      .catch(() => setValores({}));
  }, [sel.vendedor, ano, mes]);

  const preenchidos = produtos.filter(p => valores[p.id] && Number(valores[p.id]) > 0);

  async function salvar() {
    setErro(""); setOk("");
    if (!sel.vendedor) { setErro("Selecione o vendedor."); return; }
    const itens = preenchidos.map(p => ({ produto_id: p.id, valor: valores[p.id] }));
    if (!itens.length) { setErro("Preencha ao menos um valor."); return; }
    setSalvando(true);
    try {
      await cadastrarMetasLote(Number(sel.vendedor), Number(ano), Number(mes), itens);
      setOk(`${itens.length} meta(s) salva(s).`);
    } catch (e) { setErro(msgErro(e)); } finally { setSalvando(false); }
  }

  return (
    <div>
      <Titulo sub="Fixe o vendedor e o mês. Preencha o valor de cada produto e salve tudo junto.">Cadastrar metas do mês</Titulo>
      <Aviso tipo="erro">{erro}</Aviso>
      <Aviso tipo="info">{ok}</Aviso>

      <div className="grid grid-cols-5 gap-3 max-w-3xl mb-5">
        <Campo label="Empresa"><Select value={sel.empresa} onChange={e => setSel(s => ({...s, empresa:e.target.value}))}>
          <option value="">…</option>{empresas.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select></Campo>
        <Campo label="Unidade"><Select value={sel.unidade} disabled={!sel.empresa} onChange={e => setSel(s => ({...s, unidade:e.target.value}))}>
          <option value="">…</option>{unidades.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select></Campo>
        <Campo label="Gerente"><Select value={sel.gerente} disabled={!sel.unidade} onChange={e => setSel(s => ({...s, gerente:e.target.value}))}>
          <option value="">…</option>{gerentes.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select></Campo>
        <Campo label="Vendedor"><Select value={sel.vendedor} disabled={!sel.gerente} onChange={e => setSel(s => ({...s, vendedor:e.target.value}))}>
          <option value="">…</option>{vendedores.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select></Campo>
        <Campo label="Mês / Ano">
          <div className="flex gap-1">
            <Select value={mes} onChange={e => setMes(e.target.value)}>{MESES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</Select>
            <Input type="number" className="w-20" value={ano} onChange={e => setAno(e.target.value)} />
          </div>
        </Campo>
      </div>

      {sel.vendedor && (
        <div className="border border-line rounded-fluent overflow-hidden max-w-2xl">
          <div className="flex justify-between px-4 py-2.5 bg-fluent-surface text-xs font-semibold text-ink-muted">
            <span>Produto</span><span>Valor da meta</span>
          </div>
          {produtos.map((p, i) => (
            <div key={p.id} className={`flex justify-between items-center px-4 py-2.5 text-sm ${i ? "border-t border-line" : ""}`}>
              <span className={valores[p.id] ? "" : "text-ink-faint"}>{p.nome}</span>
              <Input type="number" step="0.01" min="0" className="w-40" placeholder="—"
                value={valores[p.id] || ""} onChange={e => setValores(v => ({ ...v, [p.id]: e.target.value }))} />
            </div>
          ))}
        </div>
      )}

      {sel.vendedor && (
        <div className="flex gap-3 mt-5 items-center">
          <Botao onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : `Salvar ${preenchidos.length} meta(s)`}</Botao>
          <span className="text-xs text-ink-faint">Produtos em branco não geram meta.</span>
        </div>
      )}
    </div>
  );
}
