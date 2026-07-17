import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

/** Busca a árvore (estrutura_no) de uma empresa e devolve tanto a lista
 * plana quanto um índice por id, útil para resolver nome/tipo/pai.
 * porId/filhosDe são memoizados — sem isso, cada render devolve uma
 * referência nova e qualquer efeito que dependa deles entra em loop. */
export function useArvore(empresaId) {
  const [nos, setNos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!empresaId) return;
    setCarregando(true);
    api
      .get(`/estrutura/arvore/${empresaId}`)
      .then(({ data }) => setNos(data))
      .finally(() => setCarregando(false));
  }, [empresaId]);

  const porId = useMemo(() => Object.fromEntries(nos.map((n) => [n.id, n])), [nos]);

  const filhosDe = useCallback((noId) => nos.filter((n) => n.no_pai_id === noId), [nos]);

  return { nos, porId, filhosDe, carregando };
}
