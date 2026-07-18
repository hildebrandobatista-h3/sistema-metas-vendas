import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Campo, Input, Botao, Aviso } from "../components/ui.jsx";
import { login, msgErro } from "../services/api.js";
import { useAuthStore } from "../store/auth.js";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  const logar = useAuthStore((s) => s.logar);
  const navigate = useNavigate();
  const location = useLocation();

  async function entrar(e) {
    e.preventDefault();
    setErro("");
    if (!usuario || !senha) {
      setErro("Preencha usuário e senha.");
      return;
    }
    setEntrando(true);
    try {
      const dados = await login(usuario, senha);
      logar(dados.access_token, dados.perfil, dados.nome);
      const destino = location.state?.de || "/";
      navigate(destino, { replace: true });
    } catch (e) {
      setErro(e?.response?.status === 401 ? "Usuário ou senha inválidos." : msgErro(e));
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="min-h-screen bg-fluent-surface flex items-center justify-center px-4">
      <form onSubmit={entrar} className="bg-white border border-line rounded-fluent shadow-sm w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <div className="w-10 h-10 rounded-fluent bg-fluent mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-ink-strong">Metas de Vendas</h1>
          <p className="text-[13px] text-ink-muted mt-1">Entre com seu usuário para continuar</p>
        </div>

        <Aviso tipo="erro">{erro}</Aviso>

        <div className="space-y-4">
          <Campo label="Usuário">
            <Input autoFocus value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Admin" />
          </Campo>
          <Campo label="Senha">
            <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
          </Campo>
        </div>

        <div className="mt-6">
          <Botao type="submit" disabled={entrando}>
            {entrando ? "Entrando…" : "Entrar"}
          </Botao>
        </div>
      </form>
    </div>
  );
}
