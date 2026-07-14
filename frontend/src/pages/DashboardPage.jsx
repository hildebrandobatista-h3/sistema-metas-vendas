import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../services/api";
import { useArvore } from "../hooks/useArvore";

const PRESETS = [
  { label: "Mês", meses: 1 },
  { label: "Trimestre", meses: 3 },
  { label: "Semestre", meses: 6 },
  { label: "Ano", meses: 12 },
];

function EvolucaoChart({ pontos }) {
  if (pontos.length === 0) return <p className="text-sm text-ink-muted">Sem dados para o período.</p>;

  const max = Math.max(...pontos.map((p) => Math.max(Number(p.meta_acumulada), Number(p.realizado_acumulado))), 1);
  const largura = 600;
  const altura = 180;
  const escalaX = (i) => 40 + (i * (largura - 60)) / Math.max(pontos.length - 1, 1);
  const escalaY = (v) => altura - 20 - (Number(v) / max) * (altura - 40);

  const pontosMeta = pontos.map((p, i) => `${escalaX(i)},${escalaY(p.meta_acumulada)}`).join(" ");
  const pontosRealizado = pontos.map((p, i) => `${escalaX(i)},${escalaY(p.realizado_acumulado)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${largura} ${altura}`} className="w-full h-auto">
      <line x1="40" y1={altura - 20} x2={largura - 20} y2={altura - 20} stroke="#c3c2b7" strokeWidth="1" />
      <polyline points={pontosMeta} fill="none" stroke="#7c8a8d" strokeWidth="2" strokeDasharray="5,5" />
      <polyline points={pontosRealizado} fill="none" stroke="#2a78d6" strokeWidth="2.5" />
      {pontos.map((p, i) => (
        <text key={i} x={escalaX(i)} y={altura - 4} fontSize="10" textAnchor="middle" fill="#7c8a8d">
          {String(p.mes).padStart(2, "0")}
        </text>
      ))}
    </svg>
  );
}

export default function DashboardPage() {
  const { empresaId, usuario } = useOutletContext();
  const { nos, porId, filhosDe, carregando: carregandoArvore } = useArvore(empresaId);

  const [produtos, setProdutos] = useState([]);
  const [produtoId, setProdutoId] = useState("");
  const [noAtual, setNoAtual] = useState(null);
  const [caminho, setCaminho] = useState([]); // breadcrumb

  const [ano, setAno] = useState(new Date().getFullYear());
  const [mesFim, setMesFim] = useState(new Date().getMonth() + 1);
  const [janelaMeses, setJanelaMeses] = useState(1);
  const mesInicio = Math.max(1, mesFim - janelaMeses + 1);

  const [ranking, setRanking] = useState([]);
  const [yoy, setYoy] = useState(null);
  const [evolucao, setEvolucao] = useState([]);
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    if (!empresaId) return;
    api.get("/produtos", { params: { empresa_id: empresaId } }).then(({ data }) => {
      setProdutos(data);
      if (data.length > 0) setProdutoId(data[0].id);
    });
  }, [empresaId]);

  useEffect(() => {
    if (nos.length === 0) return;
    // Ponto de partida é o próprio nó do usuário (seu escopo começa ali) —
    // Admin não tem nó próprio, então parte da raiz (visão global).
    const proprioNo = usuario?.estrutura_no_id ? porId[usuario.estrutura_no_id] : null;
    const inicial = proprioNo || nos.find((n) => n.tipo === "EMPRESA");
    if (!inicial) return;

    const caminhoAte = [];
    let atual = inicial;
    while (atual) {
      caminhoAte.unshift(atual);
      atual = atual.no_pai_id ? porId[atual.no_pai_id] : null;
    }
    setNoAtual(inicial);
    setCaminho(caminhoAte);
  }, [nos, usuario, porId]);

  useEffect(() => {
    if (!noAtual || !produtoId) return;

    api
      .get("/competencias", { params: { empresa_id: empresaId } })
      .then(({ data }) => {
        const comp = data.find((c) => c.ano === Number(ano) && c.mes === Number(mesFim));
        if (!comp) {
          setRanking([]);
          setAlertas([]);
          return;
        }
        api
          .get(`/dashboard/nivel/${noAtual.id}`, {
            params: { competencia_id: comp.id, produto_id: produtoId },
          })
          .then(({ data }) => setRanking(data));

        api
          .get(`/dashboard/alertas-gap/${comp.id}`)
          .then(({ data }) => setAlertas(data))
          .catch(() => setAlertas([]));
      });

    api
      .get("/dashboard/evolucao", {
        params: {
          empresa_id: empresaId,
          no_id: noAtual.id,
          produto_id: produtoId,
          ano,
          mes_inicio: mesInicio,
          mes_fim: mesFim,
        },
      })
      .then(({ data }) => setEvolucao(data));

    api
      .get("/dashboard/yoy", {
        params: {
          empresa_id: empresaId,
          no_id: noAtual.id,
          produto_id: produtoId,
          ano,
          mes_inicio: mesInicio,
          mes_fim: mesFim,
        },
      })
      .then(({ data }) => setYoy(data));
  }, [noAtual, produtoId, ano, mesFim, mesInicio, empresaId]);

  function entrarNoNo(no) {
    const filhos = filhosDe(no.estrutura_no_id || no.id);
    const alvo = nos.find((n) => n.id === (no.estrutura_no_id || no.id));
    if (!alvo) return;
    if (filhos.length === 0) return; // nó-folha, nada a detalhar
    setNoAtual(alvo);
    setCaminho((c) => [...c, alvo]);
  }

  function irPara(no, indice) {
    setNoAtual(no);
    setCaminho((c) => c.slice(0, indice + 1));
  }

  return (
    <div>
      <div className="mb-6">
        <div className="text-[10.5px] uppercase tracking-wide text-ink-muted font-semibold">Tela 04</div>
        <h2 className="text-2xl mt-1">Dashboard</h2>
        <p className="text-sm text-ink-2 mt-2 max-w-[62ch]">
          Todo percentual é soma(realizado) / soma(meta) — nunca média de percentuais.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center mb-4 text-sm">
        {caminho.map((no, i) => (
          <span key={no.id} className="flex items-center gap-2">
            {i > 0 && <span className="text-ink-muted">/</span>}
            <button
              onClick={() => irPara(no, i)}
              className={i === caminho.length - 1 ? "font-semibold" : "text-ink-2 hover:underline"}
            >
              {no.nome}
            </button>
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-end mb-5">
        <div>
          <label className="text-xs font-semibold text-ink-2 mb-1 block">Produto</label>
          <select
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
            className="border border-border-strong rounded-lg px-3 py-2 text-sm"
          >
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-2 mb-1 block">Ano</label>
          <input
            type="number"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            className="border border-border-strong rounded-lg px-3 py-2 text-sm w-24 font-mono"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-2 mb-1 block">Mês final</label>
          <input
            type="number"
            min="1"
            max="12"
            value={mesFim}
            onChange={(e) => setMesFim(e.target.value)}
            className="border border-border-strong rounded-lg px-3 py-2 text-sm w-20 font-mono"
          />
        </div>
        <div className="flex gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setJanelaMeses(p.meses)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold border ${
                janelaMeses === p.meses
                  ? "bg-accent-soft border-accent text-accent-soft-ink"
                  : "border-border-strong text-ink-2"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="text-[11px] uppercase tracking-wide text-ink-muted font-semibold">Atingimento</div>
          <div className="font-serif text-2xl mt-1">
            {yoy?.atual.percentual != null ? `${yoy.atual.percentual}%` : "—"}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="text-[11px] uppercase tracking-wide text-ink-muted font-semibold">Meta</div>
          <div className="font-mono text-xl mt-1 tabular">{yoy?.atual.meta ?? "—"}</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="text-[11px] uppercase tracking-wide text-ink-muted font-semibold">Realizado</div>
          <div className="font-mono text-xl mt-1 tabular">{yoy?.atual.realizado ?? "—"}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3">Evolução acumulada</h3>
          <EvolucaoChart pontos={evolucao} />
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3">Comparação YoY (mesma janela, ano anterior)</h3>
          {yoy && !yoy.anterior.tem_dado ? (
            <p className="text-sm text-ink-muted">
              Sem histórico digitado para {ano - 1} ainda — a comparação fica muda até alguém preencher.
            </p>
          ) : yoy ? (
            <div className="text-sm space-y-1">
              <div>
                Atual: <span className="font-mono tabular">{yoy.atual.realizado}</span> /{" "}
                <span className="font-mono tabular">{yoy.atual.meta}</span>
                {yoy.atual.percentual != null && ` (${yoy.atual.percentual}%)`}
              </div>
              <div>
                {ano - 1}: <span className="font-mono tabular">{yoy.anterior.realizado}</span> /{" "}
                <span className="font-mono tabular">{yoy.anterior.meta}</span>
                {yoy.anterior.percentual != null && ` (${yoy.anterior.percentual}%)`}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3">Ranking — filhos de {noAtual?.nome}</h3>
          {carregandoArvore ? (
            <p className="text-sm text-ink-muted">Carregando...</p>
          ) : ranking.length === 0 ? (
            <p className="text-sm text-ink-muted">Sem indicadores para esta seleção.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-ink-muted text-left">
                  <th className="font-semibold pb-1.5">Nó</th>
                  <th className="font-semibold pb-1.5 text-right">Meta</th>
                  <th className="font-semibold pb-1.5 text-right">Realizado</th>
                  <th className="font-semibold pb-1.5 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => {
                  const no = nos.find((n) => n.id === r.estrutura_no_id);
                  return (
                    <tr key={r.estrutura_no_id} className="border-t border-border">
                      <td className="py-1.5">
                        <button onClick={() => entrarNoNo(r)} className="hover:underline text-left">
                          {no?.nome || r.estrutura_no_id}
                        </button>
                      </td>
                      <td className="py-1.5 text-right font-mono tabular">{r.meta}</td>
                      <td className="py-1.5 text-right font-mono tabular">{r.realizado}</td>
                      <td className="py-1.5 text-right font-mono tabular">
                        {r.percentual != null ? `${r.percentual}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3">Alerta de gap</h3>
          {alertas.length === 0 ? (
            <p className="text-sm text-ink-muted">Nenhuma violação de piso nesta competência.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {alertas.map((a, i) => (
                <div
                  key={i}
                  className="text-sm rounded-lg border border-warning-fill/45 bg-warning-fill/15 text-warning-ink px-3 py-2"
                >
                  Meta <span className="font-mono">{a.meta_pai}</span>, soma dos filhos{" "}
                  <span className="font-mono">{a.soma_filhos}</span> — gap{" "}
                  <span className="font-mono">{a.gap}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
