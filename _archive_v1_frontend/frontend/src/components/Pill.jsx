const VARIANTES = {
  neutral: "bg-surface-2 text-ink-2",
  live: "bg-accent-soft text-accent-soft-ink",
  good: "bg-good/15 text-good",
  warn: "bg-warning-fill/20 text-warning-ink",
  crit: "bg-critical/15 text-critical-ink",
};

export default function Pill({ children, variante = "neutral" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap ${VARIANTES[variante]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
