import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.js";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/realizado", label: "Realizado" },
  { to: "/metas", label: "Meta" },
];

export default function Layout() {
  const nome = useAuthStore((s) => s.nome);
  const perfil = useAuthStore((s) => s.perfil);
  const deslogar = useAuthStore((s) => s.deslogar);
  const navigate = useNavigate();

  const nav = perfil === "admin" ? [...NAV, { to: "/cadastros", label: "Cadastros" }, { to: "/usuarios", label: "Usuários" }] : NAV;

  function sair() {
    deslogar();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-white text-ink">
      <header className="bg-fluent px-5 py-3 flex items-center gap-3">
        <span className="text-white text-[15px] font-semibold">Metas de Vendas</span>
        <div className="flex-1" />
        <span className="text-white/80 text-[13px]">{nome}{perfil ? ` · ${perfil}` : ""}</span>
        <button
          onClick={sair}
          className="text-white/80 text-[13px] hover:text-white underline underline-offset-2"
        >
          Sair
        </button>
      </header>
      <div className="flex">
        <nav className="w-48 min-h-[calc(100vh-52px)] bg-fluent-surface border-r border-line py-3 text-sm">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `block px-5 py-2.5 border-l-[3px] ${
                  isActive
                    ? "text-fluent font-semibold border-fluent bg-fluent-light"
                    : "text-ink border-transparent hover:bg-fluent-light/50"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 p-6 max-w-[1100px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
