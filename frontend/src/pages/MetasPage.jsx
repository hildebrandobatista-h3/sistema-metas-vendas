import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, extrairErro } from "../services/api";
import { useArvore } from "../hooks/useArvore";
import { useEmpresaStore } from "../store/empresa";
import Pill from "../components/Pill";
import SemEmpresa from "../components/SemEmpresa";

const STATUS_VARIANTE = { RASCUNHO: "neutral", PUBLICADA: "live" };
const ORDEM_TIPOS = ["EMPRESA", "UNIDADE", "DIRETOR", "GERENTE", "VENDEDOR"];
const ROTULO_TIPO = {
  EMPRESA: "Empresa",
  UNIDADE: "Unidade",
  DIRETOR: "Diretor",
  GERENTE: "Gerente",
  VENDEDOR: "Vendedor",
};

export default function MetasPage() {
  const { empresaId } = useOutletContext();
  const setEmpresaId = useEmpresaStore((s) => s.setEmpresaId);
  const { nos, porId, carregando: carregandoArvore } = useArvore(empresaId);

  const [empresas, setEmpresas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [noSelecionado, setNoSelecionado] = useState(null);
  const [produtoId, setProdutoId] = useState("");
  const [competenciaId, setCompetenciaId] = useState("");
  const [tipoMedida, setTipoMedida] = useState("VALOR");
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");

  const [metaAtual, setMetaAtual] = useState(null); // null = não existe ainda
  const [historico, setHistorico] = useState([]);
  const [mensagem, setMensagem] = useState(null);
  const [erro, setErro] = useState(null);
  const [publicando, setPublicando] = useState(false);
  const [resultadoPublicacao, setResultadoPublicacao] = useState(null);

  useEffect(() => {
    api.get("/estrutura/empresas").then(({ data }) => setEmpresas(data));
  }, []);

  useEffect(() => {
    // Empresa mudou (ou a árvore foi recarregada) — o nó escolhido antes não vale mais.
    setNoSelecionado(null);
    setProdutoId("");
    setCompetenciaId("");
  }, [empresaId]);

  useEffect(() => {
    if (!empresaId) return;
    api.get("/produtos", { params: { empresa_id: empresaId } }).then(({ data }) => setProdutos(data));
    api.get("/competencias", { params: { empresa_id: empresaId } }).then(({ data }) => setCompetencias(data));
  }, [empresaId]);

  useEffect(() => {
    setMetaAtual(null);
    setHistorico([]);
    setResultadoPublicacao(null);
    setErro(null);
    if (!noSelecionado || !produtoId || !competenciaId) return;

    api
      .get("/metas", {
        params: { competencia_id: competenciaId, estrutura_no_id: noSelecionado.id, produto_id: produtoId },
      })
      .then(({ data }) => {
        setMetaAtual(data);
        setTipoMedida(data.tipo_medida);
        setValor(data.valor_meta);
        api.get(`/metas/${data.id}/historico`).then((h) => setHistorico(h.data));
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setValor("");
          setMotivo("");
        }
      });
  }, [noSelecionado, produtoId, competenciaId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem(null);
    setErro(null);
    try {
      if (metaAtual) {
        const { data } = await api.put(`/metas/${metaAtual.id}`, { valor_meta: valor, motivo });
        setMetaAtual(data);
        const h = await api.get(`/metas/${data.id}/historico`);
        setHistorico(h.data);
        setMensagem("Meta atualizada.");
      } else {
        const { data } = await api.post("/metas", {
          competencia_id: competenciaId,
          estrutura_no_id: noSelecionado.id,
          produto_id: produtoId,
          tipo_medida: tipoMedida,
          valor_meta: valor,
        });
        setMetaAtual(data);
        const h = await api.get(`/metas/${data.id}/historico`);
        setHistorico(h.data);
        setMensagem("Meta criada como rascunho.");
      }
    } catch (err) {
      setErro(extrairErro(err));
    }
  }

  async function handlePublicar() {
    if (!metaAtual) return;
    setPublicando(true);
    setResultadoPublicacao(null);
    setErro(null);
    try {
      const { data } = await api.post(`/metas/${metaAtual.id}/publicar`);
      setResultadoPublicacao(data);
      if (data.publicada) {
        setMetaAtual({ ...metaAtual, status: "PUBLICADA" });
      }
    } catch (err) {
      setErro(extrairErro(err));
    } finally {
      setPublicando(false);
    }
  }

  if (!empresaId) return <SemEmpresa />;

  // Caminho da raiz até o nó selecionado, pra alimentar a "migalha de pão".
  const caminho = [];
  if (noSelecionado) {
    let atual = noSelecionado;
    while (atual) {
      caminho.unshift(atual);
      atual = atual.no_pai_id ? porId[atual.no_pai_id] : null;
    }
  }

  const gruposNo = ORDEM_TIPOS.map((tipo) => ({ tipo, itens: nos.filter((n) => n.tipo === tipo) })).filter(
    (g) => g.itens.length > 0
  );

  return (
    <div>
      <div className="mb-6">
        <div className="text-[10.5px] uppercase tracking-wide text-ink-muted font-semibold">Tela 01</div>
        <h2 className="text-2xl mt-1">Cadastro de meta</h2>
        <p className="text-sm text-ink-2 mt-2 max-w-[62ch]">
          Uma meta por competência × nó da árvore × produto. Escolha a empresa, o nível desejado, o
          produto e a competência para ver ou criar a meta.
        </p>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4 items-start">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="mb-4">
            <label className="text-xs font-semibold text-ink-2 mb-1 block">Empresa</label>
            <select
              className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
            >
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.razao_social}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-ink-muted mt-1">As empresas listadas respeitam sua permissão.</p>
          </div>

          <label className="text-xs font-semibold text-ink-2 mb-2 block">Nível da meta</label>
          <div className="flex flex-wrap gap-1.5 items-center px-3 py-2.5 border border-dashed border-border-strong rounded-lg bg-surface-2 mb-2 min-h-[38px] text-sm">
            {caminho.length === 0 ? (
              <span className="text-ink-muted">Selecione um nó abaixo.</span>
            ) : (
              caminho.map((n, i) => (
                <span key={n.id} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-ink-muted">▸</span>}
                  <span className="bg-surface border border-border rounded px-2 py-0.5 font-semibold text-xs">
                    {n.nome}
                  </span>
                </span>
              ))
            )}
          </div>

          {carregandoArvore ? (
            <p className="text-sm text-ink-muted">Carregando árvore...</p>
          ) : (
            <select
              className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
              value={noSelecionado?.id || ""}
              onChange={(e) => setNoSelecionado(nos.find((n) => n.id === e.target.value) || null)}
            >
              <option value="">Selecione...</option>
              {gruposNo.map((g) => (
                <optgroup key={g.tipo} label={ROTULO_TIPO[g.tipo]}>
                  {g.itens.map((n) => (
                    <option key={n.id} value={n.id}>
                      {g.tipo === "EMPRESA"
                        ? `Empresa — ${n.nome} (meta no topo)`
                        : `${ROTULO_TIPO[g.tipo]} — ${n.nome}`}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
          <p className="text-[11px] text-ink-muted mt-1.5 mb-4">
            A meta pode ser lançada em qualquer nível: empresa, unidade, diretor, gerente ou vendedor.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-2 mb-1 block">Produto</label>
              <select
                className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-2 mb-1 block">Competência</label>
              <select
                className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
                value={competenciaId}
                onChange={(e) => setCompetenciaId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {competencias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {String(c.mes).padStart(2, "0")}/{c.ano} — {c.status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {noSelecionado && produtoId && competenciaId && (
            <form onSubmit={handleSubmit} className="mt-5 border-t border-border pt-4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-2">
                  {metaAtual ? "Editando meta de" : "Nova meta para"} <strong>{noSelecionado.nome}</strong>
                </span>
                {metaAtual && <Pill variante={STATUS_VARIANTE[metaAtual.status]}>{metaAtual.status}</Pill>}
              </div>

              {!metaAtual && (
                <div>
                  <label className="text-xs font-semibold text-ink-2 mb-1.5 block">Medida da meta</label>
                  <div className="flex gap-2">
                    {["VALOR", "QUANTIDADE"].map((t) => (
                      <label
                        key={t}
                        className={`flex-1 border rounded-lg px-3 py-2 text-sm cursor-pointer text-center ${
                          tipoMedida === t
                            ? "border-accent bg-accent-soft text-accent-soft-ink font-semibold"
                            : "border-border-strong"
                        }`}
                      >
                        <input
                          type="radio"
                          name="tipo_medida"
                          value={t}
                          checked={tipoMedida === t}
                          onChange={() => setTipoMedida(t)}
                          className="hidden"
                        />
                        {t === "VALOR" ? "Valor (R$)" : "Quantidade"}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-ink-2 mb-1 block">
                  Valor da meta {metaAtual && `(${metaAtual.tipo_medida})`}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  disabled={metaAtual?.status === "PUBLICADA"}
                  className="w-full max-w-[220px] border border-border-strong rounded-lg px-3 py-2 text-sm font-mono tabular disabled:bg-surface-2 disabled:text-ink-muted"
                />
              </div>

              {metaAtual && metaAtual.status !== "PUBLICADA" && (
                <div>
                  <label className="text-xs font-semibold text-ink-2 mb-1 block">Motivo da alteração</label>
                  <input
                    type="text"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
                    placeholder="Ex.: revisão de orçamento trimestral"
                  />
                </div>
              )}

              {erro && (
                <div className="text-sm rounded-lg border border-critical/40 bg-critical/10 text-critical-ink px-3 py-2">
                  {erro}
                </div>
              )}
              {mensagem && (
                <div className="text-sm rounded-lg border border-accent/30 bg-accent-soft text-accent-soft-ink px-3 py-2">
                  {mensagem}
                </div>
              )}

              {resultadoPublicacao && !resultadoPublicacao.publicada && (
                <div className="text-sm rounded-lg border border-warning-fill/45 bg-warning-fill/15 text-warning-ink px-3 py-2">
                  Bloqueado pelo piso: soma dos filhos{" "}
                  <strong className="font-mono">{resultadoPublicacao.soma_filhos}</strong> contra meta de{" "}
                  <strong className="font-mono">{valor}</strong> (gap{" "}
                  <strong className="font-mono">{resultadoPublicacao.gap}</strong>).
                </div>
              )}
              {resultadoPublicacao?.publicada && (
                <div className="text-sm rounded-lg border border-good/30 bg-good/10 text-good px-3 py-2">
                  Meta publicada com sucesso.
                </div>
              )}

              {metaAtual?.status !== "PUBLICADA" && (
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold"
                  >
                    {metaAtual ? "Salvar alteração" : "Salvar rascunho"}
                  </button>
                  {metaAtual && (
                    <button
                      type="button"
                      onClick={handlePublicar}
                      disabled={publicando}
                      className="border border-border-strong rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                      {publicando ? "Publicando..." : "Publicar meta"}
                    </button>
                  )}
                </div>
              )}
            </form>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Histórico</h3>
          {historico.length === 0 ? (
            <p className="text-sm text-ink-muted">Sem alterações registradas ainda.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-ink-muted text-left">
                  <th className="font-semibold pb-1.5">Quando</th>
                  <th className="font-semibold pb-1.5 text-right">De → Para</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((h) => (
                  <tr key={h.id} className="border-t border-border">
                    <td className="py-1.5 font-mono">{new Date(h.alterado_em).toLocaleString("pt-BR")}</td>
                    <td className="py-1.5 text-right font-mono tabular">
                      {h.valor_anterior ?? "—"} → {h.valor_novo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
