import { useState, useEffect } from "react";
import { Titulo, Select, moeda } from "../components/ui.jsx";
import { listarEmpresas, listarUnidades, listarProdutos, buscarDashboard } from "../services/api.js";

const ANO_ATUAL = new Date().getFullYear();
const PERIODOS = [["mensal","Mês"],["trimestre","Trim."],["semestre","Sem."],["anual","Ano"]];
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function corPct(p) { return p >= 90 ? "#107c10" : p >= 70 ? "#0078d4" : "#d13438"; }

export default function DashboardPage() {
  const [empresas, setEmpresas] = useState([]); const [unidades, setUnidades] = useState([]); const [produtos, setProdutos] = useState([]);
  const [f, setF] = useState({ empresa:"", unidade:"", produto:"", tipo:"mensal", ref: String(new Date().getMonth()+1), ano: String(ANO_ATUAL) });
  const [dados, setDados] = useState(null); const [carregando, setCarregando] = useState(false);

  useEffect(() => { listarEmpresas().then(setEmpresas).catch(() => {}); listarProdutos().then(setProdutos).catch(() => {}); }, []);
  useEffect(() => { if (f.empresa) listarUnidades(f.empresa).then(setUnidades).catch(() => {}); else setUnidades([]); }, [f.empresa]);

  useEffect(() => {
    setF(prev => {
      let ref = prev.ref;
      if (prev.tipo === "trimestre" && Number(ref) > 4) ref = "1";
      if (prev.tipo === "semestre" && Number(ref) > 2) ref = "1";
      if (prev.tipo === "anual") ref = "1";
      if (prev.tipo === "mensal" && Number(ref) > 12) ref = "1";
      return { ...prev, ref };
    });
  }, [f.tipo]);

  useEffect(() => {
    setCarregando(true);
    const params = { ano: Number(f.ano), periodo_tipo: f.tipo, periodo_ref: Number(f.ref) };
    if (f.empresa) params.empresa_id = Number(f.empresa);
    if (f.unidade) params.unidade_id = Number(f.unidade);
    if (f.produto) params.produto_id = Number(f.produto);
    buscarDashboard(params).then(setDados).catch(() => setDados(null)).finally(() => setCarregando(false));
  }, [f]);

  const opcoesRef = f.tipo === "mensal" ? MESES.map((m,i) => [String(i+1), m])
    : f.tipo === "trimestre" ? [["1","1º trim"],["2","2º trim"],["3","3º trim"],["4","4º trim"]]
    : f.tipo === "semestre" ? [["1","1º sem"],["2","2º sem"]] : [["1", String(f.ano)]];

  return (
    <div>
      <Titulo>Dashboard</Titulo>
      <div className="flex gap-2 flex-wrap items-center mb-4">
        <Select value={f.empresa} onChange={e => setF({...f, empresa:e.target.value, unidade:""})} >
          <option value="">Empresa: Todas</option>{empresas.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select>
        <Select value={f.unidade} disabled={!f.empresa} onChange={e => setF({...f, unidade:e.target.value})}>
          <option value="">Unidade: Todas</option>{unidades.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select>
        <Select value={f.produto} onChange={e => setF({...f, produto:e.target.value})}>
          <option value="">Produto: Todos</option>{produtos.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select>
        <div className="flex-1" />
        <div className="flex border border-fluent rounded-fluent overflow-hidden text-[13px]">
          {PERIODOS.map(([v,l]) => (
            <button key={v} onClick={() => setF({...f, tipo:v})}
              className={`px-3 py-1.5 ${f.tipo === v ? "bg-fluent text-white font-semibold" : "bg-white text-fluent"}`}>{l}</button>
          ))}
        </div>
        <Select value={f.ref} onChange={e => setF({...f, ref:e.target.value})} >
          {opcoesRef.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</Select>
      </div>

      {carregando && <p className="text-sm text-ink-muted">Carregando…</p>}

      {dados && !carregando && (
        <>
          <p className="text-xs text-ink-faint mb-3">{f.ano} · meses: {dados.meses.map(m => MESES[m-1]).join(" + ")}{f.produto ? ` · produto filtrado` : ""}</p>
          <div className="grid grid-cols-3 gap-2.5 mb-2">
            <div className="bg-fluent-surface rounded-fluent px-4 py-3">
              <div className="text-xs text-ink-muted mb-1">Meta do período</div>
              <div className="text-2xl font-semibold text-ink-strong">{moeda(dados.meta_total)}</div></div>
            <div className="bg-fluent-surface rounded-fluent px-4 py-3">
              <div className="text-xs text-ink-muted mb-1">Realizado</div>
              <div className="text-2xl font-semibold text-ink-strong">{moeda(dados.realizado_total)}</div></div>
            <div className="bg-fluent-light rounded-fluent px-4 py-3">
              <div className="text-xs text-fluent mb-1">Atingimento</div>
              <div className="text-2xl font-semibold text-fluent">{dados.percentual_total}%</div></div>
          </div>
          <div className="h-2 bg-[#eef1f5] rounded overflow-hidden my-3">
            <div className="h-full bg-fluent" style={{ width: `${Math.min(dados.percentual_total,100)}%` }} /></div>

          <p className="text-sm font-semibold text-ink-strong mt-6 mb-2">Ranking de vendedores</p>
          {dados.linhas.length === 0 ? <p className="text-[13px] text-ink-faint">Sem dados para este período.</p> : (
            <div className="border border-line rounded-fluent overflow-hidden text-sm">
              <div className="grid grid-cols-[2fr_1.3fr_1.3fr_0.8fr] px-4 py-2.5 bg-fluent-surface text-xs font-semibold text-ink-muted">
                <span>Vendedor</span><span className="text-right">Meta</span><span className="text-right">Realizado</span><span className="text-right">%</span></div>
              {dados.linhas.map((l, i) => (
                <div key={i} className="grid grid-cols-[2fr_1.3fr_1.3fr_0.8fr] px-4 py-2.5 border-t border-line">
                  <span>{l.vendedor_nome}{l.produto_nome && !f.produto ? <span className="text-ink-faint text-xs"> · {l.produto_nome}</span> : ""}</span>
                  <span className="text-right">{moeda(l.meta)}</span>
                  <span className="text-right">{moeda(l.realizado)}</span>
                  <span className="text-right font-semibold" style={{ color: corPct(l.percentual) }}>{l.percentual}%</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
