import { useState, useEffect } from "react";
import { Campo, Input, Select, Botao, Aviso } from "./ui.jsx";
import {
  listarEmpresas, listarUnidades, listarGerentes, listarVendedores,
  editarUsuario, msgErro,
} from "../services/api.js";

const PERFIS = [["admin", "Admin"], ["gerente", "Gerente"], ["vendedor", "Vendedor"]];

export default function EditarUsuarioModal({ usuario, isOpen, onClose, onSave }) {
  const [form, setForm] = useState({ nome: "", login: "", senha: "", perfil: "admin", gerente_id: "", vendedor_id: "" });
  const [sel, setSel] = useState({ empresa: "", unidade: "", gerente: "" });
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [gerentes, setGerentes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!isOpen || !usuario) return;
    setForm({ nome: usuario.nome, login: usuario.login, senha: "", perfil: usuario.perfil, gerente_id: usuario.gerente_id ?? "", vendedor_id: usuario.vendedor_id ?? "" });
    setErro("");
    listarEmpresas().then(setEmpresas).catch(() => {});
    setUnidades([]); setGerentes([]); setVendedores([]);
    setSel({ empresa: "", unidade: "", gerente: "" });
  }, [isOpen, usuario]);

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

  async function salvar() {
    setErro("");
    if (!form.nome || !form.login) { setErro("Nome e login são obrigatórios."); return; }
    if (form.perfil === "gerente" && !form.gerente_id) { setErro("Selecione o gerente vinculado."); return; }
    if (form.perfil === "vendedor" && !form.vendedor_id) { setErro("Selecione o vendedor vinculado."); return; }
    if (form.senha && form.senha.length < 8) { setErro("A senha deve ter ao menos 8 caracteres."); return; }
    setSalvando(true);
    try {
      const payload = {
        nome: form.nome,
        login: form.login,
        perfil: form.perfil,
        gerente_id: form.perfil === "gerente" ? Number(form.gerente_id) : null,
        vendedor_id: form.perfil === "vendedor" ? Number(form.vendedor_id) : null,
      };
      if (form.senha.trim()) payload.senha = form.senha;
      await editarUsuario(usuario.id, payload);
      onSave();
    } catch (e) {
      setErro(msgErro(e));
    } finally {
      setSalvando(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-neutral-900 rounded-fluent shadow-xl w-full max-w-lg p-6">
        <h2 className="text-base font-semibold text-ink-strong mb-4">Editar usuário — {usuario?.login}</h2>
        <Aviso tipo="erro">{erro}</Aviso>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <Campo label="Nome">
            <Input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
          </Campo>
          <Campo label="Login">
            <Input value={form.login} onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))} />
          </Campo>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <Campo label="Perfil">
            <Select value={form.perfil} onChange={(e) => setForm((f) => ({ ...f, perfil: e.target.value }))}>
              {PERFIS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Campo>
          <Campo label="Nova senha" dica="deixe vazio para não alterar">
            <Input type="password" value={form.senha} onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))} placeholder="mín. 8 caracteres" />
          </Campo>
        </div>

        {form.perfil !== "admin" && (
          <div className="grid grid-cols-2 gap-3 mb-3">
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
          </div>
        )}

        {form.perfil === "gerente" && (
          <div className="mb-3">
            <Campo label="Gerente">
              <Select value={form.gerente_id} disabled={!sel.unidade} onChange={(e) => setForm((f) => ({ ...f, gerente_id: e.target.value }))}>
                <option value="">Selecione…</option>
                {gerentes.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
              </Select>
            </Campo>
          </div>
        )}

        {form.perfil === "vendedor" && (
          <div className="grid grid-cols-2 gap-3 mb-3">
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
          </div>
        )}

        <div className="flex gap-3 mt-5 justify-end">
          <Botao variant="secondary" onClick={onClose} disabled={salvando}>Cancelar</Botao>
          <Botao onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</Botao>
        </div>
      </div>
    </div>
  );
}
