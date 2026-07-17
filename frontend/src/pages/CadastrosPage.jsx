import { useState, useEffect, useCallback } from "react";
import { Titulo, Campo, Input, Select, Botao, Aviso } from "../components/ui.jsx";
import {
  listarEmpresas, criarEmpresa, listarUnidades, criarUnidade,
  listarGerentes, criarGerente, listarVendedores, criarVendedor,
  listarProdutos, criarProduto, msgErro,
} from "../services/api.js";

const ABAS = ["Empresas", "Unidades", "Gerentes", "Vendedores", "Produtos"];

export default function CadastrosPage() {
  const [aba, setAba] = useState("Empresas");
  return (
    <div>
      <Titulo>Cadastros</Titulo>
      <div className="flex gap-0.5 border-b border-line mb-5 text-sm">
        {ABAS.map(a => (
          <button key={a} onClick={() => setAba(a)}
            className={`px-4 py-2 ${aba === a ? "text-fluent font-semibold border-b-2 border-fluent" : "text-ink-muted"}`}>
            {a}
          </button>
        ))}
      </div>
      {aba === "Empresas" && <AbaEmpresas />}
      {aba === "Unidades" && <AbaUnidades />}
      {aba === "Gerentes" && <AbaGerentes />}
      {aba === "Vendedores" && <AbaVendedores />}
      {aba === "Produtos" && <AbaProdutos />}
    </div>
  );
}

function Lista({ itens, render }) {
  if (!itens.length) return <p className="text-[13px] text-ink-faint mt-3">Nenhum registro ainda.</p>;
  return (
    <div className="border border-line rounded-fluent overflow-hidden mt-4 text-sm max-w-xl">
      {itens.map((x, i) => (
        <div key={x.id} className={`flex justify-between px-4 py-2.5 ${i ? "border-t border-line" : ""}`}>{render(x)}</div>
      ))}
    </div>
  );
}

function AbaEmpresas() {
  const [itens, setItens] = useState([]); const [nome, setNome] = useState(""); const [erro, setErro] = useState("");
  const load = useCallback(() => listarEmpresas().then(setItens).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);
  async function add() { setErro(""); try { await criarEmpresa(nome); setNome(""); load(); } catch (e) { setErro(msgErro(e)); } }
  return (
    <div className="max-w-xl">
      <Aviso tipo="erro">{erro}</Aviso>
      <div className="flex gap-2 items-end">
        <div className="flex-1"><Campo label="Nome da empresa"><Input value={nome} onChange={e => setNome(e.target.value)} placeholder="ASH" /></Campo></div>
        <Botao onClick={add}>Adicionar</Botao>
      </div>
      <Lista itens={itens} render={x => <span>{x.nome}</span>} />
    </div>
  );
}

function AbaUnidades() {
  const [empresas, setEmpresas] = useState([]); const [empresaId, setEmpresaId] = useState("");
  const [itens, setItens] = useState([]); const [nome, setNome] = useState(""); const [erro, setErro] = useState("");
  useEffect(() => { listarEmpresas().then(setEmpresas).catch(() => {}); }, []);
  const load = useCallback(() => { if (empresaId) listarUnidades(empresaId).then(setItens).catch(() => {}); else setItens([]); }, [empresaId]);
  useEffect(() => { load(); }, [load]);
  async function add() { setErro(""); try { await criarUnidade(Number(empresaId), nome); setNome(""); load(); } catch (e) { setErro(msgErro(e)); } }
  return (
    <div className="max-w-xl">
      <Aviso tipo="erro">{erro}</Aviso>
      <Campo label="Empresa"><Select value={empresaId} onChange={e => setEmpresaId(e.target.value)}>
        <option value="">Selecione…</option>{empresas.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
      </Select></Campo>
      {empresaId && <div className="flex gap-2 items-end mt-3">
        <div className="flex-1"><Campo label="Nome da unidade"><Input value={nome} onChange={e => setNome(e.target.value)} placeholder="CNT TCKS" /></Campo></div>
        <Botao onClick={add}>Adicionar</Botao>
      </div>}
      <Lista itens={itens} render={x => <span>{x.nome}</span>} />
    </div>
  );
}

function AbaGerentes() {
  const [empresas, setEmpresas] = useState([]); const [unidades, setUnidades] = useState([]);
  const [empresaId, setEmpresaId] = useState(""); const [unidadeId, setUnidadeId] = useState("");
  const [itens, setItens] = useState([]); const [nome, setNome] = useState(""); const [erro, setErro] = useState("");
  useEffect(() => { listarEmpresas().then(setEmpresas).catch(() => {}); }, []);
  useEffect(() => { setUnidadeId(""); if (empresaId) listarUnidades(empresaId).then(setUnidades).catch(() => {}); else setUnidades([]); }, [empresaId]);
  const load = useCallback(() => { if (unidadeId) listarGerentes(unidadeId).then(setItens).catch(() => {}); else setItens([]); }, [unidadeId]);
  useEffect(() => { load(); }, [load]);
  async function add() { setErro(""); try { await criarGerente(Number(unidadeId), nome); setNome(""); load(); } catch (e) { setErro(msgErro(e)); } }
  return (
    <div className="max-w-xl">
      <Aviso tipo="erro">{erro}</Aviso>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Empresa"><Select value={empresaId} onChange={e => setEmpresaId(e.target.value)}>
          <option value="">Selecione…</option>{empresas.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select></Campo>
        <Campo label="Unidade"><Select value={unidadeId} disabled={!empresaId} onChange={e => setUnidadeId(e.target.value)}>
          <option value="">Selecione…</option>{unidades.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select></Campo>
      </div>
      {unidadeId && <div className="flex gap-2 items-end mt-3">
        <div className="flex-1"><Campo label="Nome do gerente"><Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Hildebrando" /></Campo></div>
        <Botao onClick={add}>Adicionar</Botao>
      </div>}
      <Lista itens={itens} render={x => <span>{x.nome}</span>} />
    </div>
  );
}

function AbaVendedores() {
  const [empresas, setEmpresas] = useState([]); const [unidades, setUnidades] = useState([]); const [gerentes, setGerentes] = useState([]);
  const [empresaId, setEmpresaId] = useState(""); const [unidadeId, setUnidadeId] = useState(""); const [gerenteId, setGerenteId] = useState("");
  const [itens, setItens] = useState([]); const [nome, setNome] = useState(""); const [ref, setRef] = useState(""); const [erro, setErro] = useState("");
  useEffect(() => { listarEmpresas().then(setEmpresas).catch(() => {}); }, []);
  useEffect(() => { setUnidadeId(""); if (empresaId) listarUnidades(empresaId).then(setUnidades).catch(() => {}); else setUnidades([]); }, [empresaId]);
  useEffect(() => { setGerenteId(""); if (unidadeId) listarGerentes(unidadeId).then(setGerentes).catch(() => {}); else setGerentes([]); }, [unidadeId]);
  const load = useCallback(() => { if (gerenteId) listarVendedores(gerenteId).then(setItens).catch(() => {}); else setItens([]); }, [gerenteId]);
  useEffect(() => { load(); }, [load]);
  async function add() { setErro(""); try { await criarVendedor(Number(gerenteId), nome, ref); setNome(""); setRef(""); load(); } catch (e) { setErro(msgErro(e)); } }
  return (
    <div className="max-w-xl">
      <Aviso tipo="erro">{erro}</Aviso>
      <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-2.5">Localização na estrutura</p>
      <div className="grid grid-cols-3 gap-3">
        <Campo label="Empresa"><Select value={empresaId} onChange={e => setEmpresaId(e.target.value)}>
          <option value="">Selecione…</option>{empresas.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select></Campo>
        <Campo label="Unidade"><Select value={unidadeId} disabled={!empresaId} onChange={e => setUnidadeId(e.target.value)}>
          <option value="">Selecione…</option>{unidades.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select></Campo>
        <Campo label="Gerente" dica="Só gerentes da unidade — sem ambiguidade de nome">
          <Select value={gerenteId} disabled={!unidadeId} onChange={e => setGerenteId(e.target.value)}>
          <option value="">Selecione…</option>{gerentes.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</Select></Campo>
      </div>
      {gerenteId && <>
        <div className="border-t border-line my-4" />
        <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-2.5">Dados do vendedor</p>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Nome"><Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Walison" /></Campo>
          <Campo label="Referência externa" opcional dica="ID no Nectar — deixar vazio por ora">
            <Input value={ref} onChange={e => setRef(e.target.value)} /></Campo>
        </div>
        <Botao onClick={add}>Salvar vendedor</Botao>
      </>}
      <Lista itens={itens} render={x => <span>{x.nome}</span>} />
    </div>
  );
}

function AbaProdutos() {
  const [itens, setItens] = useState([]); const [nome, setNome] = useState(""); const [erro, setErro] = useState("");
  const load = useCallback(() => listarProdutos().then(setItens).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);
  async function add() { setErro(""); try { await criarProduto(nome); setNome(""); load(); } catch (e) { setErro(msgErro(e)); } }
  return (
    <div className="max-w-xl">
      <Aviso tipo="erro">{erro}</Aviso>
      <div className="flex gap-2 items-end">
        <div className="flex-1"><Campo label="Nome do produto"><Input value={nome} onChange={e => setNome(e.target.value)} placeholder="MRR" /></Campo></div>
        <Botao onClick={add}>Adicionar</Botao>
      </div>
      <Lista itens={itens} render={x => <span>{x.nome}</span>} />
    </div>
  );
}
