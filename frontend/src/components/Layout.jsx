import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useEmpresaStore } from "../store/empresa";
import { api } from "../services/api";

const ITENS_NAV = [
  { to: "/metas", label: "Cadastro de Meta" },
  { to: "/vendas", label: "Lançamento de Venda" },
  { to: "/competencias", label: "Fechamento de Competência" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Layout() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const empresaId = useEmpresaStore((s) => s.empresaId);
  const setEmpresaId = useEmpresaStore((s) => s.setEmpresaId);

  useEffect(() => {
    if (!usuario) return;
    if (usuario.empresa_id) {
      setEmpresaId(usuario.empresa_id);
      return;
    }
    // Admin é global — carrega a lista e escolhe a primeira por padrão.
    api.get("/estrutura/empresas").then(({ data }) => {
      if (data.length > 0) setEmpresaId(data[0].id);
    });
  }, [usuario, setEmpresaId]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 flex-none bg-surface border-r border-border p-5 flex flex-col gap-5 sticky top-0 h-screen">
        <div className="pb-3 border-b border-border">
          <div className="text-[10.5px] uppercase tracking-wide text-ink-muted font-semibold">
            Metas de Vendas
          </div>
          <h1 className="text-lg mt-1">{usuario?.nome}</h1>
          <div className="text-xs text-ink-muted mt-0.5">{usuario?.papel}</div>
        </div>

        <nav className="flex flex-col gap-1">
          {ITENS_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-[13.5px] ${
                  isActive
                    ? "bg-accent-soft text-accent-soft-ink font-semibold"
                    : "text-ink-2 hover:bg-surface-2"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto text-left text-[13px] text-ink-muted hover:text-ink-2 border-t border-border pt-3"
        >
          Sair
        </button>
      </aside>

      <main className="flex-1 min-w-0 p-8 max-w-6xl">
        {!empresaId ? (
          <p className="text-ink-muted text-sm">Carregando empresa...</p>
        ) : (
          <Outlet context={{ empresaId, usuario }} />
        )}
      </main>
    </div>
  );
}
