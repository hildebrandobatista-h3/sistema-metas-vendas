import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, extrairErro } from "../services/api";
import Pill from "../components/Pill";
import SemEmpresa from "../components/SemEmpresa";

const STATUS_VARIANTE = { ABERTA: "neutral", PUBLICADA: "live", FECHADA: "neutral" };

export default function CompetenciasPage() {
  const { empresaId, usuario } = useOutletContext();
  const ehAdmin = usuario?.papel === "ADMIN";

  const [competencias, setCompetencias] = useState([]);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [erro, setErro] = useState(null);
  const [violacoesPorCompetencia, setViolacoesPorCompetencia] = useState({});
  const [motivoReabertura, setMotivoReabertura] = useState({});
  const [eventos, setEventos] = useState({});

  function carregar() {
    api.get("/competencias", { params: { empresa_id: empresaId } }).then(({ data }) => setCompetencias(data));
  }

  useEffect(() => {
    if (empresaId) carregar();
  }, [empresaId]);

  async function handleCriar(e) {
    e.preventDefault();
    setErro(null);
    try {
      await api.post("/competencias", { empresa_id: empresaId, ano: Number(ano), mes: Number(mes) });
      carregar();
    } catch (err) {
      setErro(extrairErro(err));
    }
  }

  async function handlePublicar(competencia) {
    setErro(null);
    try {
      const { data } = await api.post(`/competencias/${competencia.id}/publicar`);
      if (data.publicada) {
        setViolacoesPorCompetencia((s) => ({ ...s, [competencia.id]: null }));
        carregar();
      } else {
        setViolacoesPorCompetencia((s) => ({ ...s, [competencia.id]: data.violacoes }));
      }
    } catch (err) {
      setErro(extrairErro(err));
    }
  }

  async function handleFechar(competencia) {
    setErro(null);
    try {
      await api.post(`/competencias/${competencia.id}/fechar`);
      carregar();
    } catch (err) {
      setErro(extrairErro(err));
    }
  }

  async function handleReabrir(competencia) {
    const motivo = motivoReabertura[competencia.id];
    if (!motivo) {
      setErro("Informe o motivo da reabertura.");
      return;
    }
    setErro(null);
    try {
      await api.post(`/competencias/${competencia.id}/reabrir`, { motivo });
      setMotivoReabertura((s) => ({ ...s, [competencia.id]: "" }));
      carregar();
    } catch (err) {
      setErro(extrairErro(err));
    }
  }

  async function handleVerEventos(competencia) {
    const { data } = await api.get(`/competencias/${competencia.id}/eventos`);
    setEventos((s) => ({ ...s, [competencia.id]: data }));
  }

  if (!empresaId) return <SemEmpresa />;

  return (
    <div>
      <div className="mb-6">
        <div className="text-[10.5px] uppercase tracking-wide text-ink-muted font-semibold">Tela 03</div>
        <h2 className="text-2xl mt-1">Fechamento de competência</h2>
        <p className="text-sm text-ink-2 mt-2 max-w-[62ch]">
          Ciclo ABERTA → PUBLICADA → FECHADA, com reabertura sempre auditada.
        </p>
      </div>

      {ehAdmin && (
        <form onSubmit={handleCriar} className="bg-surface border border-border rounded-xl p-4 mb-4 flex items-end gap-3">
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
            <label className="text-xs font-semibold text-ink-2 mb-1 block">Mês</label>
            <input
              type="number"
              min="1"
              max="12"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="border border-border-strong rounded-lg px-3 py-2 text-sm w-20 font-mono"
            />
          </div>
          <button type="submit" className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold">
            Nova competência
          </button>
        </form>
      )}

      {erro && (
        <div className="text-sm rounded-lg border border-critical/40 bg-critical/10 text-critical-ink px-3 py-2 mb-4">
          {erro}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {competencias.map((c) => (
          <div key={c.id} className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-serif text-lg">
                  {String(c.mes).padStart(2, "0")}/{c.ano}
                </span>
                <Pill variante={STATUS_VARIANTE[c.status]}>{c.status}</Pill>
              </div>
              <div className="flex gap-2">
                {c.status === "ABERTA" && (
                  <button
                    onClick={() => handlePublicar(c)}
                    className="bg-accent text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
                  >
                    Publicar
                  </button>
                )}
                {c.status === "PUBLICADA" && ehAdmin && (
                  <button
                    onClick={() => handleFechar(c)}
                    className="border border-border-strong rounded-lg px-3 py-1.5 text-xs font-semibold"
                  >
                    Fechar
                  </button>
                )}
                <button
                  onClick={() => handleVerEventos(c)}
                  className="text-xs text-ink-muted hover:text-ink-2 px-2"
                >
                  Ver trilha
                </button>
              </div>
            </div>

            {violacoesPorCompetencia[c.id]?.length > 0 && (
              <div className="mt-3 rounded-lg border border-critical/40 bg-critical/10 p-3">
                <p className="text-sm text-critical-ink font-semibold mb-2">
                  {violacoesPorCompetencia[c.id].length} violação(ões) de piso — publicação bloqueada.
                </p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-ink-muted text-left">
                      <th className="font-semibold pb-1">Meta do pai</th>
                      <th className="font-semibold pb-1 text-right">Soma filhos</th>
                      <th className="font-semibold pb-1 text-right">Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violacoesPorCompetencia[c.id].map((v, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="py-1 font-mono tabular">{v.meta_pai}</td>
                        <td className="py-1 text-right font-mono tabular">{v.soma_filhos}</td>
                        <td className="py-1 text-right font-mono tabular text-critical-ink">{v.gap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {c.status === "FECHADA" && ehAdmin && (
              <div className="mt-3 flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Motivo da reabertura (obrigatório)"
                  value={motivoReabertura[c.id] || ""}
                  onChange={(e) => setMotivoReabertura((s) => ({ ...s, [c.id]: e.target.value }))}
                  className="flex-1 border border-border-strong rounded-lg px-3 py-1.5 text-xs"
                />
                <button
                  onClick={() => handleReabrir(c)}
                  className="border border-border-strong rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap"
                >
                  Reabrir
                </button>
              </div>
            )}

            {eventos[c.id] && (
              <table className="w-full text-xs mt-3 border-t border-border pt-2">
                <tbody>
                  {eventos[c.id].map((ev) => (
                    <tr key={ev.id} className="border-t border-border">
                      <td className="py-1.5 font-mono">{new Date(ev.executado_em).toLocaleString("pt-BR")}</td>
                      <td className="py-1.5">
                        <Pill variante={ev.acao === "FECHOU" ? "neutral" : "live"}>{ev.acao}</Pill>
                      </td>
                      <td className="py-1.5 text-ink-2">{ev.observacao || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
