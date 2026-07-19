import { useState, useEffect, useRef } from "react";
import { Campo, Input, Select, Botao, Aviso } from "../../components/ui.jsx";
import CurrencyInput from "./components/CurrencyInput";
import ReplicarMetasModal from "../../components/ReplicarMetasModal.jsx";
import ConflictDialog from "../../components/ConflictDialog.jsx";
import {
  listarEmpresas, listarUnidades, listarGerentes, listarVendedores,
  listarProdutos, cadastrarMetasLote, listarMetas, msgErro, replicarMetas,
} from "../../services/api.js";

const MESES = [["1","Jan"],["2","Fev"],["3","Mar"],["4","Abr"],["5","Mai"],["6","Jun"],
  ["7","Jul"],["8","Ago"],["9","Set"],["10","Out"],["11","Nov"],["12","Dez"]];

export default function CadastroMetasGrid({ filtros, onFiltroChange }) {
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [gerentes, setGerentes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [valores, setValores] = useState({});
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [showReplicarModal, setShowReplicarModal] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflitos, setConflitos] = useState([]);
  const [loadingReplicacao, setLoadingReplicacao] = useState(false);
  const [periodosDestino, setPeriodosDestino] = useState([]);
  const [periodoOrigemId, setPeriodoOrigemId] = useState(null);
  const inputRefs = useRef({});

  useEffect(() => {
    listarEmpresas().then(setEmpresas).catch(() => {});
    listarProdutos().then(setProdutos).catch(() => {});
  }, []);

  useEffect(() => {
    setUnidades([]);
    if (filtros.empresa_id) {
      listarUnidades(filtros.empresa_id).then(setUnidades).catch(() => {});
    }
  }, [filtros.empresa_id]);

  useEffect(() => {
    setGerentes([]);
    if (filtros.unidade_id) {
      listarGerentes(filtros.unidade_id).then(setGerentes).catch(() => {});
    }
  }, [filtros.unidade_id]);

  useEffect(() => {
    setVendedores([]);
    if (filtros.gerente_id) {
      listarVendedores(filtros.gerente_id).then(setVendedores).catch(() => {});
    }
  }, [filtros.gerente_id]);

  useEffect(() => {
    if (!filtros.vendedor_id || !filtros.ano || !filtros.mes) return;
    listarMetas({ vendedor_id: filtros.vendedor_id, ano: Number(filtros.ano), mes: Number(filtros.mes) })
      .then((ms) => {
        const v = {};
        ms.forEach((m) => {
          v[m.produto_id] = String(m.valor);
        });
        setValores(v);
      })
      .catch(() => setValores({}));
  }, [filtros.vendedor_id, filtros.ano, filtros.mes]);

  const preenchidos = produtos.filter((p) => valores[p.id] && Number(valores[p.id]) > 0);
  const total = preenchidos.reduce((sum, p) => sum + Number(valores[p.id] || 0), 0);

  async function salvar() {
    setErro("");
    setOk("");
    if (!filtros.vendedor_id) {
      setErro("Selecione o vendedor.");
      return;
    }
    const itens = preenchidos.map((p) => ({ produto_id: p.id, valor: Number(valores[p.id]) }));
    if (!itens.length) {
      setErro("Preencha ao menos um valor.");
      return;
    }
    setSalvando(true);
    try {
      await cadastrarMetasLote(Number(filtros.vendedor_id), Number(filtros.ano), Number(filtros.mes), itens);
      setOk(`${itens.length} meta(s) salva(s).`);
    } catch (e) {
      setErro(msgErro(e));
    } finally {
      setSalvando(false);
    }
  }

  async function handleReplicar(data) {
    setLoadingReplicacao(true);
    setErro("");
    try {
      const periodoId = Number(filtros.mes);
      setPeriodoOrigemId(periodoId);
      setPeriodosDestino(data.periodos_destino_ids);

      const response = await replicarMetas(
        Number(filtros.vendedor_id),
        periodoId,
        data.periodos_destino_ids,
        false
      );

      if (response.status === 202) {
        setConflitos(response.data.conflitos);
        setShowConflictDialog(true);
        setShowReplicarModal(false);
      } else if (response.status === 200) {
        setOk("Metas replicadas com sucesso!");
        setShowReplicarModal(false);
        carregarMetas();
      } else {
        setErro(response.data.detail || "Erro ao replicar metas");
      }
    } catch (e) {
      setErro(msgErro(e));
    } finally {
      setLoadingReplicacao(false);
    }
  }

  async function handleConfirmarSobrescrita() {
    setLoadingReplicacao(true);
    setErro("");
    try {
      const response = await replicarMetas(
        Number(filtros.vendedor_id),
        periodoOrigemId,
        periodosDestino,
        true
      );

      if (response.status === 200) {
        setOk("Metas replicadas e atualizadas com sucesso!");
        setShowConflictDialog(false);
        carregarMetas();
      } else {
        setErro(response.data.detail || "Erro ao sobrescrever metas");
      }
    } catch (e) {
      setErro(msgErro(e));
    } finally {
      setLoadingReplicacao(false);
    }
  }

  function carregarMetas() {
    if (!filtros.vendedor_id || !filtros.ano || !filtros.mes) return;
    listarMetas({ vendedor_id: filtros.vendedor_id, ano: Number(filtros.ano), mes: Number(filtros.mes) })
      .then((ms) => {
        const v = {};
        ms.forEach((m) => {
          v[m.produto_id] = String(m.valor);
        });
        setValores(v);
      })
      .catch(() => setValores({}));
  }

  function handleKeyDown(e, produtoIdx) {
    if (e.key === "Enter") {
      e.preventDefault();
      salvar().then(() => {
        if (produtoIdx < produtos.length - 1) {
          const nextRef = inputRefs.current[produtos[produtoIdx + 1].id];
          if (nextRef) nextRef.focus();
        }
      });
    } else if (e.key === "Tab") {
      const direction = e.shiftKey ? -1 : 1;
      const nextIdx = produtoIdx + direction;
      if (nextIdx >= 0 && nextIdx < produtos.length) {
        e.preventDefault();
        const nextId = produtos[nextIdx].id;
        const nextRef = inputRefs.current[nextId];
        if (nextRef) nextRef.focus();
      }
    }
  }

  return (
    <div>
      <Aviso tipo="erro">{erro}</Aviso>
      <Aviso tipo="info">{ok}</Aviso>

      {/* Filtros */}
      <div className="grid grid-cols-5 gap-3 max-w-4xl mb-5">
        <Campo label="Empresa">
          <Select
            value={filtros.empresa_id}
            onChange={(e) => onFiltroChange({ empresa_id: e.target.value, unidade_id: "", gerente_id: "", vendedor_id: "" })}
          >
            <option value="">…</option>
            {empresas.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo label="Unidade">
          <Select
            value={filtros.unidade_id}
            disabled={!filtros.empresa_id}
            onChange={(e) => onFiltroChange({ unidade_id: e.target.value, gerente_id: "", vendedor_id: "" })}
          >
            <option value="">…</option>
            {unidades.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo label="Gerente">
          <Select
            value={filtros.gerente_id}
            disabled={!filtros.unidade_id}
            onChange={(e) => onFiltroChange({ gerente_id: e.target.value, vendedor_id: "" })}
          >
            <option value="">…</option>
            {gerentes.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo label="Vendedor">
          <Select
            value={filtros.vendedor_id}
            disabled={!filtros.gerente_id}
            onChange={(e) => onFiltroChange({ vendedor_id: e.target.value })}
          >
            <option value="">…</option>
            {vendedores.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo label="Mês / Ano">
          <div className="flex gap-1">
            <Select value={filtros.mes} onChange={(e) => onFiltroChange({ mes: e.target.value })}>
              {MESES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
            <Input type="number" className="w-20" value={filtros.ano} onChange={(e) => onFiltroChange({ ano: e.target.value })} />
          </div>
        </Campo>
      </div>

      {/* Grid de Metas */}
      {filtros.vendedor_id && (
        <>
          <div className="border border-gray-200 rounded-lg overflow-hidden max-w-2xl mb-5">
            <div className="flex justify-between px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-700 border-b">
              <span>Produto</span>
              <span>Valor da Meta</span>
            </div>
            {produtos.map((p, i) => (
              <div key={p.id} className={`flex justify-between items-center px-4 py-3 text-sm ${i ? "border-t border-gray-200" : ""}`}>
                <span className={valores[p.id] && Number(valores[p.id]) > 0 ? "font-medium text-gray-900" : "text-gray-500"}>
                  {p.nome}
                </span>
                <CurrencyInput
                  ref={(el) => (inputRefs.current[p.id] = el)}
                  value={valores[p.id] || 0}
                  onChange={(val) => setValores((v) => ({ ...v, [p.id]: val }))}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  autoFocus={i === 0 && filtros.vendedor_id}
                />
              </div>
            ))}
            <div className="flex justify-between px-4 py-3 bg-blue-50 text-sm font-semibold text-blue-900 border-t border-blue-200">
              <span>Total</span>
              <span>R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 items-center">
            <Botao onClick={salvar} disabled={salvando || !preenchidos.length}>
              {salvando ? "Salvando…" : `Salvar ${preenchidos.length} Meta(s)`}
            </Botao>
            <Botao onClick={() => setShowReplicarModal(true)} disabled={loadingReplicacao || !preenchidos.length}>
              {loadingReplicacao ? "Processando…" : "Replicar Próximos Meses"}
            </Botao>
            <span className="text-xs text-gray-500">Produtos em branco não geram meta.</span>
          </div>
        </>
      )}

      <ReplicarMetasModal
        isOpen={showReplicarModal}
        vendedorId={filtros.vendedor_id ? Number(filtros.vendedor_id) : null}
        periodoOrigemId={Number(filtros.mes)}
        onClose={() => setShowReplicarModal(false)}
        onReplicate={handleReplicar}
      />

      <ConflictDialog
        isOpen={showConflictDialog}
        conflitos={conflitos}
        onConfirm={handleConfirmarSobrescrita}
        onCancel={() => setShowConflictDialog(false)}
      />
    </div>
  );
}
