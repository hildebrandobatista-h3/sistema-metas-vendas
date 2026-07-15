import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, extrairErro } from "../services/api";
import { useEmpresaStore } from "../store/empresa";

const ABAS = [
  { id: "empresas", label: "Empresas" },
  { id: "unidades", label: "Unidades" },
  { id: "usuarios", label: "Usuários" },
  { id: "produtos", label: "Produtos" },
];

const PAPEIS = ["ADMIN", "DIRETOR", "GERENTE", "VENDEDOR"];

export default function AdminPage() {
  const { empresaId, recarregarEmpresas } = useOutletContext();
  const setEmpresaId = useEmpresaStore((s) => s.setEmpresaId);

  const [aba, setAba] = useState("empresas");
  const [empresas, setEmpresas] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(empresaId || "");
  const [nos, setNos] = useState([]);
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  function carregarEmpresas() {
    api.get("/estrutura/empresas").then(({ data }) => {
      setEmpresas(data);
      if (!empresaSelecionada && data.length > 0) setEmpresaSelecionada(data[0].id);
    });
  }

  useEffect(() => {
    carregarEmpresas();
  }, []);

  useEffect(() => {
    if (!empresaSelecionada) {
      setNos([]);
      return;
    }
    api.get(`/estrutura/arvore/${empresaSelecionada}`).then(({ data }) => setNos(data));
  }, [empresaSelecionada]);

  function aviso(fn) {
    return async (...args) => {
      setErro(null);
      setMensagem(null);
      try {
        await fn(...args);
      } catch (err) {
        setErro(extrairErro(err));
      }
    };
  }

  const unidades = nos.filter((n) => n.tipo === "UNIDADE");
  const diretores = nos.filter((n) => n.tipo === "DIRETOR");
  const gerentes = nos.filter((n) => n.tipo === "GERENTE");
  const vendedores = nos.filter((n) => n.tipo === "VENDEDOR");

  return (
    <div>
      <div className="mb-6">
        <div className="text-[10.5px] uppercase tracking-wide text-ink-muted font-semibold">
          Administração
        </div>
        <h2 className="text-2xl mt-1">Estrutura organizacional</h2>
        <p className="text-sm text-ink-2 mt-2 max-w-[62ch]">
          Cadastro de empresa, unidade, usuário e produto — só visível para Admin.
        </p>
      </div>

      <div className="flex gap-1.5 mb-5">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              setAba(a.id);
              setErro(null);
              setMensagem(null);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold border ${
              aba === a.id
                ? "bg-accent-soft border-accent text-accent-soft-ink"
                : "border-border-strong text-ink-2"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {erro && (
        <div className="text-sm rounded-lg border border-critical/40 bg-critical/10 text-critical-ink px-3 py-2 mb-4">
          {erro}
        </div>
      )}
      {mensagem && (
        <div className="text-sm rounded-lg border border-accent/30 bg-accent-soft text-accent-soft-ink px-3 py-2 mb-4">
          {mensagem}
        </div>
      )}

      {aba === "empresas" && (
        <SecaoEmpresas
          empresas={empresas}
          onCriada={(nova) => {
            setEmpresas((e) => [...e, nova]);
            setMensagem(`Empresa "${nova.razao_social}" criada.`);
            if (!empresaId) {
              setEmpresaId(nova.id);
              recarregarEmpresas();
            }
            setEmpresaSelecionada(nova.id);
          }}
          aviso={aviso}
        />
      )}

      {aba !== "empresas" && (
        <div className="mb-4">
          <label className="text-xs font-semibold text-ink-2 mb-1 block">Empresa</label>
          <select
            className="border border-border-strong rounded-lg px-3 py-2 text-sm max-w-xs"
            value={empresaSelecionada}
            onChange={(e) => setEmpresaSelecionada(e.target.value)}
          >
            <option value="">Selecione...</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.razao_social}
              </option>
            ))}
          </select>
          {empresas.length === 0 && (
            <p className="text-[11px] text-ink-muted mt-1">
              Cadastre uma empresa primeiro na aba "Empresas".
            </p>
          )}
        </div>
      )}

      {aba === "unidades" && empresaSelecionada && (
        <SecaoUnidades
          empresaId={empresaSelecionada}
          unidades={unidades}
          onCriada={(nova) => {
            setNos((n) => [...n, { ...nova, tipo: "UNIDADE" }]);
            setMensagem(`Unidade "${nova.nome}" criada.`);
            api.get(`/estrutura/arvore/${empresaSelecionada}`).then(({ data }) => setNos(data));
          }}
          aviso={aviso}
        />
      )}

      {aba === "usuarios" && empresaSelecionada && (
        <SecaoUsuarios
          empresaId={empresaSelecionada}
          unidades={unidades}
          diretores={diretores}
          gerentes={gerentes}
          vendedores={vendedores}
          onCriado={(nome) => {
            setMensagem(`Usuário "${nome}" criado.`);
            api.get(`/estrutura/arvore/${empresaSelecionada}`).then(({ data }) => setNos(data));
          }}
          aviso={aviso}
        />
      )}

      {aba === "produtos" && empresaSelecionada && (
        <SecaoProdutos empresaId={empresaSelecionada} aviso={aviso} setMensagem={setMensagem} />
      )}
    </div>
  );
}

function SecaoEmpresas({ empresas, onCriada, aviso }) {
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");

  const handleSubmit = aviso(async (e) => {
    e.preventDefault();
    const { data } = await api.post("/estrutura/empresas", { razao_social: razaoSocial, cnpj });
    setRazaoSocial("");
    setCnpj("");
    onCriada(data);
  });

  return (
    <div className="grid grid-cols-[1fr_1.2fr] gap-4 items-start">
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold">Nova empresa</h3>
        <div>
          <label className="text-xs font-semibold text-ink-2 mb-1 block">Razão social</label>
          <input
            required
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-2 mb-1 block">CNPJ</label>
          <input
            required
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="00.000.000/0001-00"
            className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm font-mono"
          />
        </div>
        <button type="submit" className="self-start bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold">
          Criar empresa
        </button>
      </form>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">Empresas cadastradas</h3>
        {empresas.length === 0 ? (
          <p className="text-sm text-ink-muted">Nenhuma ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {empresas.map((emp) => (
              <li key={emp.id} className="border-b border-border pb-2">
                <div className="font-medium">{emp.razao_social}</div>
                <div className="text-ink-muted font-mono text-xs">{emp.cnpj}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SecaoUnidades({ empresaId, unidades, onCriada, aviso }) {
  const [nome, setNome] = useState("");

  const handleSubmit = aviso(async (e) => {
    e.preventDefault();
    const { data } = await api.post("/estrutura/unidades", { empresa_id: empresaId, nome });
    setNome("");
    onCriada(data);
  });

  return (
    <div className="grid grid-cols-[1fr_1.2fr] gap-4 items-start">
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold">Nova unidade</h3>
        <div>
          <label className="text-xs font-semibold text-ink-2 mb-1 block">Nome</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="self-start bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold">
          Criar unidade
        </button>
      </form>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">Unidades desta empresa</h3>
        {unidades.length === 0 ? (
          <p className="text-sm text-ink-muted">Nenhuma ainda.</p>
        ) : (
          <ul className="flex flex-col gap-1.5 text-sm">
            {unidades.map((u) => (
              <li key={u.id}>{u.nome}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SecaoUsuarios({ empresaId, unidades, diretores, gerentes, vendedores, onCriado, aviso }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] = useState("VENDEDOR");
  const [unidadeId, setUnidadeId] = useState("");
  const [superiorId, setSuperiorId] = useState("");

  const handleSubmit = aviso(async (e) => {
    e.preventDefault();
    const payload = { nome, email, senha, papel };
    if (papel === "DIRETOR") payload.unidade_id = unidadeId;
    if (papel === "GERENTE" || papel === "VENDEDOR") payload.superior_id = superiorId;
    await api.post("/estrutura/usuarios", payload);
    const nomeCriado = nome;
    setNome("");
    setEmail("");
    setSenha("");
    setUnidadeId("");
    setSuperiorId("");
    onCriado(nomeCriado);
  });

  return (
    <div className="grid grid-cols-[1fr_1.2fr] gap-4 items-start">
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold">Novo usuário</h3>
        <div>
          <label className="text-xs font-semibold text-ink-2 mb-1 block">Nome</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-2 mb-1 block">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-2 mb-1 block">Senha</label>
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-2 mb-1 block">Papel</label>
          <select
            value={papel}
            onChange={(e) => setPapel(e.target.value)}
            className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
          >
            {PAPEIS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {papel === "DIRETOR" && (
          <div>
            <label className="text-xs font-semibold text-ink-2 mb-1 block">Unidade</label>
            <select
              required
              value={unidadeId}
              onChange={(e) => setUnidadeId(e.target.value)}
              className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.ref_id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        {papel === "GERENTE" && (
          <div>
            <label className="text-xs font-semibold text-ink-2 mb-1 block">Diretor (superior)</label>
            <select
              required
              value={superiorId}
              onChange={(e) => setSuperiorId(e.target.value)}
              className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {diretores.map((d) => (
                <option key={d.id} value={d.ref_id}>
                  {d.nome}
                </option>
              ))}
            </select>
            {diretores.length === 0 && (
              <p className="text-[11px] text-ink-muted mt-1">Cadastre um Diretor antes.</p>
            )}
          </div>
        )}

        {papel === "VENDEDOR" && (
          <div>
            <label className="text-xs font-semibold text-ink-2 mb-1 block">Gerente (superior)</label>
            <select
              required
              value={superiorId}
              onChange={(e) => setSuperiorId(e.target.value)}
              className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {gerentes.map((g) => (
                <option key={g.id} value={g.ref_id}>
                  {g.nome}
                </option>
              ))}
            </select>
            {gerentes.length === 0 && (
              <p className="text-[11px] text-ink-muted mt-1">Cadastre um Gerente antes.</p>
            )}
          </div>
        )}

        <button type="submit" className="self-start bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold">
          Criar usuário
        </button>
      </form>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">Estrutura atual</h3>
        <div className="flex flex-col gap-3 text-sm">
          <div>
            <div className="text-[11px] uppercase text-ink-muted font-semibold mb-1">Diretores</div>
            {diretores.length === 0 ? (
              <p className="text-ink-muted text-xs">Nenhum.</p>
            ) : (
              diretores.map((d) => <div key={d.id}>{d.nome}</div>)
            )}
          </div>
          <div>
            <div className="text-[11px] uppercase text-ink-muted font-semibold mb-1">Gerentes</div>
            {gerentes.length === 0 ? (
              <p className="text-ink-muted text-xs">Nenhum.</p>
            ) : (
              gerentes.map((g) => <div key={g.id}>{g.nome}</div>)
            )}
          </div>
          <div>
            <div className="text-[11px] uppercase text-ink-muted font-semibold mb-1">Vendedores</div>
            {vendedores.length === 0 ? (
              <p className="text-ink-muted text-xs">Nenhum.</p>
            ) : (
              vendedores.map((v) => <div key={v.id}>{v.nome}</div>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SecaoProdutos({ empresaId, aviso, setMensagem }) {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");

  useEffect(() => {
    api.get("/produtos", { params: { empresa_id: empresaId } }).then(({ data }) => setProdutos(data));
  }, [empresaId]);

  const handleSubmit = aviso(async (e) => {
    e.preventDefault();
    const { data } = await api.post("/produtos", { empresa_id: empresaId, nome });
    setNome("");
    setProdutos((p) => [...p, data]);
    setMensagem(`Produto "${data.nome}" criado.`);
  });

  return (
    <div className="grid grid-cols-[1fr_1.2fr] gap-4 items-start">
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold">Novo produto</h3>
        <div>
          <label className="text-xs font-semibold text-ink-2 mb-1 block">Nome</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="self-start bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold">
          Criar produto
        </button>
      </form>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">Produtos desta empresa</h3>
        {produtos.length === 0 ? (
          <p className="text-sm text-ink-muted">Nenhum ainda.</p>
        ) : (
          <ul className="flex flex-col gap-1.5 text-sm">
            {produtos.map((p) => (
              <li key={p.id}>{p.nome}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
