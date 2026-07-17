import { NavLink, Outlet } from "react-router-dom";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/realizado", label: "Lançar realizado" },
  { to: "/metas", label: "Cadastrar meta" },
  { to: "/cadastros", label: "Cadastros" },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-white text-ink">
      <header className="bg-fluent px-5 py-3 flex items-center gap-3">
        <span className="text-white text-[15px] font-semibold">Metas de Vendas</span>
      </header>
      <div className="flex">
        <nav className="w-48 min-h-[calc(100vh-52px)] bg-fluent-surface border-r border-line py-3 text-sm">
          {NAV.map((n) => (
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
