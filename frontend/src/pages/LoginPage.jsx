import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, buscarUsuarioLogado } from "../services/auth";
import { extrairErro } from "../services/api";
import { useAuthStore } from "../store/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const setLogin = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const { access_token } = await login(email, senha);
      setLogin(access_token, null);
      const usuario = await buscarUsuarioLogado();
      setLogin(access_token, usuario);
      navigate("/dashboard");
    } catch (err) {
      setErro(extrairErro(err));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-xl shadow-sm p-8">
        <div className="text-[10.5px] uppercase tracking-wide text-ink-muted font-semibold">
          Metas de Vendas
        </div>
        <h1 className="text-2xl mt-1 mb-6">Entrar</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-border-strong rounded-lg px-3 py-2 text-sm"
              autoComplete="username"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink-2">Senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="border border-border-strong rounded-lg px-3 py-2 text-sm"
              autoComplete="current-password"
            />
          </div>

          {erro && (
            <div className="text-sm rounded-lg border border-critical/40 bg-critical/10 text-critical-ink px-3 py-2">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="mt-2 bg-accent text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
