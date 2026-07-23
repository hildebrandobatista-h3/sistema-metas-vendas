import { useState, useEffect } from "react";
import { Titulo, Select, moeda } from "../components/ui.jsx";
import { listarEmpresas, listarUnidades, listarGerentes, listarVendedores, listarProdutos, buscarDashboard } from "../services/api.js";

const ANO_ATUAL = new Date().getFullYear();
const PERIODOS = [["mensal","Mês"],["trimestre","Trim."],["semestre","Sem."],["anual","Ano"]];
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function corPct(p) { return p >= 90 ? "#107c10" : p >= 70 ? "#0078d4" : "#d13438"; }

const AVATAR_CORES = ["#0078d4", "#107c10", "#8764b8", "#d97706", "#d13438"];
function avatarCor(i) { return AVATAR_CORES[i % AVATAR_CORES.length]; }
function iniciais(nome) {
  return nome.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export default function DashboardPage() {
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [gerentes, setGerentes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [f, setF] = useState({ empresa:"", unidade:"", gerente:"", vendedor:"", produto:"", tipo:"mensal", ref: String(new Date().getMonth()+1), ano: String(ANO_ATUAL) });
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => { listarEmpresas().then(setEmpresas).catch(() => {}); listarProdutos().then(setProdutos).catch(() => {}); }, []);
  
  useEffect(() => {
    if (f.empresa) {
      listarUnidades(f.empresa).then(setUnidades).catch(() => {});
    } else {
      setUnidades([]);
      setGerentes([]);
      setVendedores([]);
      setF(prev => ({ ...prev, unidade:"", gerente:"", vendedor:"" }));
    }
  }, [f.empresa]);

  useEffect(() => {
    if (f.unidade) {
      listarGerentes(f.unidade).then(setGerentes).catch(() => {});
    } else {
      setGerentes([]);
      setVendedores([]);
      setF(prev => ({ ...prev, gerente:"", vendedor:"" }));
    }
  }, [f.unidade]);

  useEffect(() => {
    if (f.gerente) {
      listarVendedores(f.gerente).then(setVendedores).catch(() => {});
    } else {
      setVendedores([]);
      setF(prev => ({ ...prev, vendedor:"" }));
    }
  }, [f.gerente]);

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
    if (f.gerente) params.gerente_id = Number(f.gerente);
    if (f.vendedor) params.vendedor_id = Number(f.vendedor);
    if (f.produto) params.produto_id = Number(f.produto);
    buscarDashboard(params).then(setDados).catch(() => setDados(null)).finally(() => setCarregando(false));
  }, [f]);

  const opcoesRef = f.tipo === "mensal" ? MESES.map((m,i) => [String(i+1), m])
    : f.tipo === "trimestre" ? [["1","1º trim"],["2","2º trim"],["3","3º trim"],["4","4º trim"]]
    : f.tipo === "semestre" ? [["1","1º sem"],["2","2º sem"]] : [["1", String(f.ano)]];

  const agruparPorVendedor = (linhas) => {
    const grupos = {};
    linhas.forEach(l => {
      if (!grupos[l.vendedor_nome]) grupos[l.vendedor_nome] = { id: l.vendedor_id, linhas: [] };
      grupos[l.vendedor_nome].linhas.push(l);
    });
    return grupos;
  };

  const vendedoresAgrupados = dados ? agruparPorVendedor(dados.linhas) : {};

  return (
    <div>
      <Titulo>Dashboard</Titulo>
      <div className="flex gap-2 flex-wrap items-center mb-4">
        <Select value={f.empresa} onChange={e => setF({...f, empresa:e.target.value, unidade:"", gerente:"", vendedor:""})}>
          <option value="">Empresa: Todas</option>{empresas.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select>
        <Select value={f.unidade} disabled={!f.empresa} onChange={e => setF({...f, unidade:e.target.value, gerente:"", vendedor:""})}>
          <option value="">Unidade: Todas</option>{unidades.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select>
        <Select value={f.gerente} disabled={!f.unidade} onChange={e => setF({...f, gerente:e.target.value, vendedor:""})}>
          <option value="">Gerente: Todos</option>{gerentes.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select>
        <Select value={f.vendedor} disabled={!f.gerente} onChange={e => setF({...f, vendedor:e.target.value})}>
          <option value="">Vendedor: Todos</option>{vendedores.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select>
        <Select value={f.produto} onChange={e => setF({...f, produto:e.target.value})}>
          <option value="">Produto: Todos</option>{produtos.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select>
        <div className="flex-1" />
        <div className="flex border border-fluent rounded-fluent overflow-hidden text-[13px]">
          {PERIODOS.map(([v,l]) => (
            <button key={v} onClick={() => setF({...f, tipo:v})}
              className={`px-3 py-1.5 ${f.tipo === v ? "bg-fluent text-white font-semibold" : "bg-white text-fluent"}`}>{l}</button>
          ))}
        </div>
        <Select value={f.ref} onChange={e => setF({...f, ref:e.target.value})}>
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

          <p className="text-sm font-semibold text-ink-strong mt-6 mb-3">Ranking de vendedores</p>
          {dados.linhas.length === 0 ? <p className="text-[13px] text-ink-faint">Sem dados para este período.</p> : (
            <div style={{ display: "grid", gap: "16px" }}>
              {Object.entries(vendedoresAgrupados).map(([nome, grupo], idx) => {
                const metaVendedor = grupo.linhas.reduce((sum, l) => sum + parseFloat(l.meta), 0);
                const realizadoVendedor = grupo.linhas.reduce((sum, l) => sum + parseFloat(l.realizado), 0);
                const pctVendedor = metaVendedor > 0 ? Math.round((realizadoVendedor / metaVendedor) * 100) : 0;
                return (
                  <div key={nome} style={{ background: "white", border: "1px solid #e0e7ef", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingBottom: "12px", borderBottom: "0.5px solid #e5e7eb" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "40px", height: "40px", borderRadius: "50%",
                          background: avatarCor(idx), color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: "600", fontSize: "14px", flexShrink: 0,
                        }}>{iniciais(nome)}</div>
                        <span style={{ fontWeight: 500, fontSize: "18px", color: "#111827" }}>{nome}</span>
                      </div>
                      <div style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "500", whiteSpace: "nowrap" }}>{grupo.linhas.length} produto{grupo.linhas.length !== 1 ? "s" : ""}</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", fontSize: "13px" }}>
                        <span style={{ color: "#626c7d" }}>Meta total</span>
                        <span style={{ fontWeight: "600" }}>{moeda(metaVendedor)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", fontSize: "13px" }}>
                        <span style={{ color: "#626c7d" }}>Realizado</span>
                        <span style={{ fontWeight: "600" }}>{moeda(realizadoVendedor)}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", fontSize: "13px", marginBottom: "12px" }}>
                      <span style={{ color: "#626c7d" }}>Atingimento geral</span>
                      <span style={{ fontWeight: "600", color: corPct(pctVendedor) }}>{pctVendedor}%</span>
                    </div>
                    <div style={{ borderTop: "0.5px solid #e5e7eb", paddingTop: "12px" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                        <thead>
                          <tr style={{ background: "#f9fafb" }}>
                            <th style={{ textAlign: "left", padding: "8px", fontWeight: "500", borderBottom: "0.5px solid #e5e7eb" }}>Produto</th>
                            <th style={{ textAlign: "right", padding: "8px", fontWeight: "500", borderBottom: "0.5px solid #e5e7eb" }}>Meta</th>
                            <th style={{ textAlign: "right", padding: "8px", fontWeight: "500", borderBottom: "0.5px solid #e5e7eb" }}>Realizado</th>
                            <th style={{ textAlign: "right", padding: "8px", fontWeight: "500", borderBottom: "0.5px solid #e5e7eb" }}>%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grupo.linhas.map((l, i) => (
                            <tr key={i} style={{ borderBottom: "0.5px solid #e5e7eb" }}>
                              <td style={{ padding: "8px", textAlign: "left" }}>{l.produto_nome}</td>
                              <td style={{ padding: "8px", textAlign: "right" }}>{moeda(l.meta)}</td>
                              <td style={{ padding: "8px", textAlign: "right" }}>{moeda(l.realizado)}</td>
                              <td style={{ padding: "8px", textAlign: "right", fontWeight: "600", color: corPct(l.percentual) }}>{l.percentual}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
    )
}
