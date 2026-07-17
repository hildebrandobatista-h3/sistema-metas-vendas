export function Botao({ children, variant = "primary", ...props }) {
  const base = "text-sm font-semibold px-5 py-2 rounded-fluent transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-fluent text-white hover:bg-fluent-hover",
    secondary: "bg-white text-ink border border-[#c8c8c8] hover:bg-fluent-surface",
  };
  return <button className={`${base} ${styles[variant]}`} {...props}>{children}</button>;
}

export function Campo({ label, opcional, children, dica }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold mb-1.5">
        {label}{opcional && <span className="text-ink-faint font-normal"> (opcional)</span>}
      </label>
      {children}
      {dica && <p className="text-xs text-ink-faint mt-1">{dica}</p>}
    </div>
  );
}

export function Input(props) {
  return (
    <input
      className="w-full h-9 px-3 rounded-fluent border border-[#c8c8c8] text-sm bg-white focus:border-fluent"
      {...props}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      className="w-full h-9 px-3 rounded-fluent border border-[#c8c8c8] text-sm bg-white focus:border-fluent disabled:bg-fluent-surface disabled:text-ink-faint"
      {...props}
    >
      {children}
    </select>
  );
}

export function Titulo({ children, sub }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-semibold text-ink-strong">{children}</h1>
      {sub && <p className="text-[13px] text-ink-muted mt-1">{sub}</p>}
    </div>
  );
}

export function Aviso({ tipo = "erro", children }) {
  if (!children) return null;
  const cor = tipo === "erro" ? "bg-red-50 text-bad border-bad/30" : "bg-fluent-light text-fluent border-fluent/30";
  return <div className={`text-sm px-4 py-2.5 rounded-fluent border mb-4 ${cor}`}>{children}</div>;
}

export function moeda(v) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
