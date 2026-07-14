import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, extrairErro } from "../services/api";
import { useArvore } from "../hooks/useArvore";
import TreePicker from "../components/TreePicker";

export default function VendasPage() {
  const { empresaId, usuario } = useOutletContext();
  const { nos, porId, carregando: carregandoArvore } = useArvore(empresaId);

  const [produtos, setProdutos] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [noSelecionado, setNoSelecionado] = useState(null);
  const [competenciaId, setCompetenciaId] = useState("");
  const [metasPublicadas, setMetasPublicadas] = useState([]);
  const [produtoId, setProdutoId] = useState("");

  const [numeroVenda, setNumeroVenda] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [dataVenda, setDataVenda] = useState("");
  const [valorLancado, setValorLancado] = useState("");

  const [vendas, setVendas] = useState([]);
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    if (!empresaId) return;
    api.get("/produtos", { params: { empresa_id: empresaId } }).then(({ data }) => setProdutos(data));
    api.get("/competencias", { params: { empresa_id: empresaId } }).then(({ data }) => setCompetencias(data));
  }, [empresaId]);

  useEffect(() => {
    if (nos.length === 0 || !usuario?.estrutura_no_id) return;
    const proprioNo = porId[usuario.estrutura_no_id];
    if (proprioNo) setNoSelecionado(proprioNo);
  }, [nos, usuario, porId]);

  function carregarVendas(noId, compId) {
    api
      .get("/vendas", { params: { competencia_id: compId, vendedor_no_id: noId } })
      .then(({ data }) => setVendas(data));
  }

  useEffect(() => {
    setMetasPublicadas([]);
    setProdutoId("");
    setVendas([]);
    if (!noSelecionado || !competenciaId) return;
    api
      .get("/metas/publicadas", {
        params: { competencia_id: competenciaId, estrutura_no_id: noSelecionado.id },
      })
      .then(({ data }) => setMetasPublicadas(data));
    carregarVendas(noSelecionado.id, competenciaId);
  }, [noSelecionado, competenciaId]);

  const metaSelecionada = metasPublicadas.find((m) => m.produto_id === produtoId);
  const competenciaSelecionada = competencias.find((c) => c.id === competenciaId);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);
    try {
      await api.post("/vendas", {
        competencia_id: competenciaId,
        vendedor_no_id: noSelecionado.id,
        produto_id: produtoId,
        numero_venda: numeroVenda,
        cliente_nome: clienteNome,
        data_venda: dataVenda,
        valor_lancado: valorLancado,
      });
      setMensagem("Venda lançada.");
      setNumeroVenda("");
      setClienteNome("");
      setDataVenda("");
      setValorLancado("");
      carregarVendas(noSelecionado.id, competenciaId);
    } catch (err) {
      setErro(extrairErro(err));
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="text-[10.5px] uppercase tracking-wide text-ink-muted font-semibold">Tela 02</div>
        <h2 className="text-2xl mt-1">Lançamento de venda (realizado)</h2>
        <p className="text-sm text-ink-2 mt-2 max-w-[62ch]">
          Só é possível lançar em produto com meta publicada na competência escolhida, e a data precisa
          cair dentro do mês da competência.
        </p>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4 items-start">
        <div className="bg-surface border border-border rounded-xl p-5">
          <label className="text-xs font-semibold text-ink-2 mb-2 block">Vendedor (nó)</label>
          {carregandoArvore ? (
            <p className="text-sm text-ink-muted">Carregando árvore...</p>
          ) : (
            <TreePicker nos={nos} selecionadoId={noSelecionado?.id} onSelect={setNoSelecionado} />
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label className="text-xs font-semibold text-ink-2 mb-1 block">Competência</label>
              <select
                className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
                value={competenciaId}
                onChange={(e) => setCompetenciaId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {competencias.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.status !== "PUBLICADA"}>
                    {String(c.mes).padStart(2, "0")}/{c.ano} — {c.status}
                    {c.status !== "PUBLICADA" ? " (bloqueada)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-2 mb-1 block">Produto</label>
              <select
                className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
                disabled={!competenciaId || !noSelecionado}
              >
                <option value="">Selecione...</option>
                {metasPublicadas.map((m) => {
                  const produto = produtos.find((p) => p.id === m.produto_id);
                  return (
                    <option key={m.id} value={m.produto_id}>
                      {produto?.nome || m.produto_id} — meta publicada
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-ink-muted mt-1">
                Só aparecem produtos com meta publicada para este nó.
              </p>
            </div>
          </div>

          {produtoId && (
            <form onSubmit={handleSubmit} className="mt-5 border-t border-border pt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink-2 mb-1 block">Número da venda</label>
                  <input
                    type="text"
                    required
                    value={numeroVenda}
                    onChange={(e) => setNumeroVenda(e.target.value)}
                    className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-2 mb-1 block">Cliente</label>
                  <input
                    type="text"
                    required
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink-2 mb-1 block">
                    Data da venda
                    {competenciaSelecionada &&
                      ` (dentro de ${String(competenciaSelecionada.mes).padStart(2, "0")}/${competenciaSelecionada.ano})`}
                  </label>
                  <input
                    type="date"
                    required
                    value={dataVenda}
                    onChange={(e) => setDataVenda(e.target.value)}
                    className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-2 mb-1 block">
                    {metaSelecionada?.tipo_medida === "QUANTIDADE" ? "Quantidade" : "Valor (R$)"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valorLancado}
                    onChange={(e) => setValorLancado(e.target.value)}
                    className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm font-mono tabular"
                  />
                </div>
              </div>

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

              <button
                type="submit"
                className="self-start bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold"
              >
                Lançar venda
              </button>
            </form>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Vendas lançadas nesta competência</h3>
          {vendas.length === 0 ? (
            <p className="text-sm text-ink-muted">Nenhuma venda lançada ainda.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-ink-muted text-left">
                  <th className="font-semibold pb-1.5">Nº</th>
                  <th className="font-semibold pb-1.5">Cliente</th>
                  <th className="font-semibold pb-1.5 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((v) => (
                  <tr key={v.id} className="border-t border-border">
                    <td className="py-1.5 font-mono">{v.numero_venda}</td>
                    <td className="py-1.5">{v.cliente_nome}</td>
                    <td className="py-1.5 text-right font-mono tabular">{v.valor_lancado}</td>
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
