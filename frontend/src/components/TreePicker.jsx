function agruparPorPai(nos) {
  const porPai = {};
  nos.forEach((no) => {
    const chave = no.no_pai_id || "raiz";
    if (!porPai[chave]) porPai[chave] = [];
    porPai[chave].push(no);
  });
  return porPai;
}

export default function TreePicker({ nos, selecionadoId, onSelect }) {
  const porPai = agruparPorPai(nos);

  function renderNivel(paiId, profundidade) {
    const filhos = porPai[paiId] || [];
    return filhos.map((no) => (
      <div key={no.id}>
        <button
          type="button"
          onClick={() => onSelect(no)}
          style={{ paddingLeft: `${8 + profundidade * 18}px` }}
          className={`w-full text-left flex items-center gap-2 py-1.5 pr-2 rounded-lg text-[13px] ${
            selecionadoId === no.id
              ? "bg-accent-soft text-accent-soft-ink font-semibold"
              : "hover:bg-surface-2 text-ink"
          }`}
        >
          <span className="font-mono text-[9.5px] border border-border rounded px-1 text-ink-muted shrink-0">
            {no.tipo}
          </span>
          <span className="truncate">{no.nome}</span>
        </button>
        {renderNivel(no.id, profundidade + 1)}
      </div>
    ));
  }

  if (nos.length === 0) {
    return <p className="text-sm text-ink-muted">Nenhum nó cadastrado nesta empresa.</p>;
  }

  return <div className="flex flex-col gap-0.5 border border-border rounded-lg p-1.5">{renderNivel("raiz", 0)}</div>;
}
