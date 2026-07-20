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

  const [form, setForm] = useState({ produto_id: "", data_venda: "", valor: "", descricao: "" });
  const [lancamentos, setLancamentos] = useState([]);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [salvando, setSalvando] = useState(false);

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
        vendedor_id: Number(sel.vendedor), produto_id: Number(form.produto_id),
        data_venda: form.data_venda, valor: form.valor, descricao: form.descricao || null,
      });
      setOk("Lançamento salvo."); setForm(f => ({ ...f, produto_id:"", valor:"", descricao:"" }));
      carregarLancamentos(sel.vendedor, form.data_venda);
    } catch (e) { setErro(msgErro(e)); } finally { setSalvando(false); }
  }

  const mesLabel = form.data_venda ? MESES[new Date(form.data_venda + "T00:00:00").getMonth()] : "";

  return (
    <div>
      <Titulo sub="Registre uma venda efetivada. A data define o mês de competência.">Lançar realizado</Titulo>
      <Aviso tipo="erro">{erro}</Aviso>
      <Aviso tipo="info">{ok}</Aviso>

      <div className="grid grid-cols-2 gap-4 max-w-xl">
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
        <Campo label="Descrição" opcional>
          <Input placeholder="contrato mensal cliente XPTO" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
        </Campo>
      </div>

      <div className="flex gap-3 mt-5">
        <Botao onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : "Salvar lançamento"}</Botao>
        <Botao variant="secondary" onClick={() => setForm({ produto_id:"", data_venda: form.data_venda, valor:"", descricao:"" })}>Limpar</Botao>
      </div>

      {lancamentos.length > 0 && (
        <div className="mt-7 border-t border-line pt-4 max-w-xl">
          <p className="text-[13px] font-semibold text-ink-strong mb-2">Lançamentos de {mesLabel}</p>
          {lancamentos.map(l => {
            const prod = produtos.find(p => p.id === l.produto_id);
            const d = new Date(l.data_venda + "T00:00:00");
            return (
              <div key={l.id} className="flex justify-between py-1.5 border-b border-line/60 text-[13px]">
                <span>{prod?.nome} · {String(d.getDate()).padStart(2,"0")}/{String(d.getMonth()+1).padStart(2,"0")}</span>
                <span className="font-semibold">{moeda(l.valor)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
