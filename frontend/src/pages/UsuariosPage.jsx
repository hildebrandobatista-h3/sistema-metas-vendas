import { useState, useEffect, useCallback } from "react";
import { Titulo, Campo, Input, Select, Botao, Aviso } from "../components/ui.jsx";
import EditarUsuarioModal from "../components/EditarUsuarioModal.jsx";
import {
  listarEmpresas, listarUnidades, listarGerentes, listarVendedores,
  listarUsuarios, criarUsuario, redefinirSenhaUsuario, inativarUsuario, msgErro,
} from "../services/api.js";
import { useAuthStore } from "../store/auth.js";

const PERFIS = [["admin", "Admin"], ["gerente", "Gerente"], ["vendedor", "Vendedor"]];

export default function UsuariosPage() {
  const perfilLogado = useAuthStore((s) => s.perfil);

  if (perfilLogado !== "admin") {
    return (
      <div>
        <Titulo>Usuários</Titulo>
        <Aviso tipo="erro">Acesso restrito a administradores.</Aviso>
      </div>
    );
  }
  return <UsuariosPageAdmin />;
}

function UsuariosPageAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [gerentes, setGerentes] = useState([]);
  const [vendedores, setVendedores] = useState([]);

  const [sel, setSel] = useState({ empresa: "", unidade: "", gerente: "" });
  const [form, setForm] = useState({ nome: "", login: "", senha: "", perfil: "admin", gerente_id: "", vendedor_id: "" });
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [redefinindo, setRedefinindo] = useState(null);
  const [novaSenha, setNovaSenha] = useState("");

  const [editando, setEditando] = useState(null);

  const carregarUsuarios = useCallback(() => listarUsuarios().then(setUsuarios).catch(() => {}), []);

  useEffect(() => {
    listarEmpresas().then(setEmpresas).catch(() => {});
    carregarUsuarios();
  }, [carregarUsuarios]);

  useEffect(() => {
    setUnidades([]); setGerentes([]); setVendedores([]);
    setSel((s) => ({ ...s, unidade: "", gerente: "" }));
    if (sel.empresa) listarUnidades(sel.empresa).then(setUnidades).catch(() => {});
  }, [sel.empresa]);

  useEffect(() => {
    setGerentes([]); setVendedores([]);
    setSel((s) => ({ ...s, gerente: "" }));
    if (sel.unidade) listarGerentes(sel.unidade).then(setGerentes).catch(() => {});
  }, [sel.unidade]);

  useEffect(() => {
    setVendedores([]);
    if (sel.gerente) listarVendedores(sel.gerente).then(setVendedores).catch(() => {});
  }, [sel.gerente]);

  useEffect(() => {
    setForm((f) => ({ ...f, gerente_id: "", vendedor_id: "" }));
  }, [form.perfil]);

  function nomeVinculo(u) {
    if (u.perfil === "gerente" && u.gerente_id) {
      const g = gerentes.find((x) => x.id === u.gerente_id);
      return g ? g.nome : `gerente #${u.gerente_id}`;
    }
    if (u.perfil === "vendedor" && u.vendedor_id) {
      const v = vendedores.find((x) => x.id === u.vendedor_id);
      return v ? v.nome : `vendedor #${u.vendedor_id}`;
    }
    return "—";
  }

  async function salvar() {
    setErro(""); setOk("");
    if (!form.nome || !form.login || !form.senha) {
      setErro("Preencha nome, login e senha.");
      return;
    }
    if (form.senha.length < 8) {
      setErro("A senha deve ter ao menos 8 caracteres.");
      return;
    }
    if (form.perfil === "gerente" && !form.gerente_id) {
      setErro("Selecione o gerente vinculado.");
      return;
    }
    if (form.perfil === "vendedor" && !form.vendedor_id) {
      setErro("Selecione o vendedor vinculado.");
      return;
    }
    setSalvando(true);
    try {
      await criarUsuario({
        nome: form.nome,
        login: form.login,
        senha: form.senha,
        perfil: form.perfil,
        gerente_id: form.perfil === "gerente" ? Number(form.gerente_id) : null,
        vendedor_id: form.perfil === "vendedor" ? Number(form.vendedor_id) : null,
      });
      setOk("Usuário criado com sucesso.");
      setForm({ nome: "", login: "", senha: "", perfil: "admin", gerente_id: "", vendedor_id: "" });
      setSel({ empresa: "", unidade: "", gerente: "" });
      carregarUsuarios();
    } catch (e) {
      setErro(msgErro(e));
    } finally {
      setSalvando(false);
    }
  }

  async function salvarNovaSenha(id) {
    setErro(""); setOk("");
    if (novaSenha.length < 8) {
      setErro("A senha deve ter ao menos 8 caracteres.");
      return;
    }
    try {
      await redefinirSenhaUsuario(id, novaSenha);
      setOk("Senha redefinida com sucesso.");
      setRedefinindo(null);
      setNovaSenha("");
    } catch (e) {
      setErro(msgErro(e));
    }
  }

  async function inativar(u) {
    if (!window.confirm(`Inativar o usuário "${u.login}"?`)) return;
    setErro(""); setOk("");
    try {
      await inativarUsuario(u.id);
      carregarUsuarios();
    } catch (e) {
      setErro(msgErro(e));
    }
  }

  return (
    <div>
      <Titulo sub="Cadastre logins de acesso ao sistema e vincule gerentes/vendedores.">Usuários</Titulo>
      <Aviso tipo="erro">{erro}</Aviso>
      <Aviso tipo="info">{ok}</Aviso>

      <div className="grid grid-cols-3 gap-3 max-w-2xl mb-3">
        <Campo label="Nome">
          <Input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Hildebrando" />
        </Campo>
        <Campo label="Login">
          <Input value={form.login} onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))} placeholder="hildebrando" />
        </Campo>
        <Campo label="Senha" dica="mínimo 8 caracteres">
          <Input type="password" value={form.senha} onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))} />
        </Campo>
      </div>

      <div className="grid grid-cols-4 gap-3 max-w-2xl mb-5">
        <Campo label="Perfil">
          <Select value={form.perfil} onChange={(e) => setForm((f) => ({ ...f, perfil: e.target.value }))}>
            {PERFIS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </Campo>

        {form.perfil !== "admin" && (
          <>
            <Campo label="Empresa">
              <Select value={sel.empresa} onChange={(e) => setSel((s) => ({ ...s, empresa: e.target.value }))}>
                <option value="">Selecione…</option>
                {empresas.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
              </Select>
            </Campo>
            <Campo label="Unidade">
              <Select value={sel.unidade} disabled={!sel.empresa} onChange={(e) => setSel((s) => ({ ...s, unidade: e.target.value }))}>
                <option value="">Selecione…</option>
                {unidades.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
              </Select>
            </Campo>
          </>
        )}

        {form.perfil === "gerente" && (
          <Campo label="Gerente">
            <Select value={form.gerente_id} disabled={!sel.unidade} onChange={(e) => setForm((f) => ({ ...f, gerente_id: e.target.value }))}>
              <option value="">Selecione…</option>
              {gerentes.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
            </Select>
          </Campo>
        )}

        {form.perfil === "vendedor" && (
          <>
            <Campo label="Gerente">
              <Select value={sel.gerente} disabled={!sel.unidade} onChange={(e) => setSel((s) => ({ ...s, gerente: e.target.value }))}>
                <option value="">Selecione…</option>
                {gerentes.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
              </Select>
            </Campo>
            <Campo label="Vendedor">
              <Select value={form.vendedor_id} disabled={!sel.gerente} onChange={(e) => setForm((f) => ({ ...f, vendedor_id: e.target.value }))}>
                <option value="">Selecione…</option>
                {vendedores.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
              </Select>
            </Campo>
          </>
        )}
      </div>

      <Botao onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : "Criar usuário"}</Botao>

      <p className="text-sm font-semibold text-ink-strong mt-8 mb-2">Usuários cadastrados</p>
      {usuarios.length === 0 ? (
        <p className="text-[13px] text-ink-faint">Nenhum usuário ainda.</p>
      ) : (
        <div className="border border-line rounded-fluent overflow-hidden text-sm max-w-3xl">
          <div className="grid grid-cols-[1.3fr_1.3fr_0.9fr_1.3fr_1fr] px-4 py-2.5 bg-fluent-surface text-xs font-semibold text-ink-muted">
            <span>Login</span><span>Nome</span><span>Perfil</span><span>Vínculo</span><span className="text-right">Ações</span>
          </div>
          {usuarios.map((u, i) => (
            <div key={u.id} className={`px-4 py-2.5 ${i ? "border-t border-line" : ""}`}>
              <div className="grid grid-cols-[1.3fr_1.3fr_0.9fr_1.3fr_1fr] items-center">
                <span>{u.login}</span>
                <span>{u.nome}</span>
                <span className="capitalize">{u.perfil}</span>
                <span className="text-ink-faint">{nomeVinculo(u)}</span>
                <div className="flex gap-3 justify-end text-[13px]">
                  <button onClick={() => setEditando(u)} className="text-fluent hover:underline">
                    Editar
                  </button>
                  <button onClick={() => { setRedefinindo(u.id); setNovaSenha(""); }} className="text-fluent hover:underline">
                    Senha
                  </button>
                  <button onClick={() => inativar(u)} className="text-bad hover:underline">
                    Inativar
                  </button>
                </div>
              </div>
              {redefinindo === u.id && (
                <div className="flex gap-2 items-center mt-2">
                  <div className="max-w-xs w-full">
                    <Input type="password" placeholder="Nova senha (mín. 8)" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
                  </div>
                  <Botao onClick={() => salvarNovaSenha(u.id)}>Salvar</Botao>
                  <Botao variant="secondary" onClick={() => setRedefinindo(null)}>Cancelar</Botao>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <EditarUsuarioModal
        usuario={editando}
        isOpen={!!editando}
        onClose={() => setEditando(null)}
        onSave={() => { setEditando(null); carregarUsuarios(); setOk("Usuário atualizado com sucesso."); }}
      />
    </div>
  );
}
