/** Paleta e tipografia herdadas do mockup aprovado na Etapa 1
 * (docs/etapa1-revisao.html) — tema claro apenas; o produto real não pediu
 * dark mode (diferente do Artifact de revisão, que precisa suportar os dois). */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#eef3f1",
        surface: "#ffffff",
        "surface-2": "#e7eeec",
        ink: "#141b1d",
        "ink-2": "#4a5659",
        "ink-muted": "#7c8a8d",
        border: "rgba(20,27,29,0.12)",
        "border-strong": "rgba(20,27,29,0.24)",
        accent: "#2f6e68",
        "accent-soft": "#e0efec",
        "accent-soft-ink": "#1c4a45",
        good: "#0ca30c",
        "warning-fill": "#fab219",
        "warning-ink": "#8a5b00",
        critical: "#d03b3b",
        "critical-ink": "#a12e2e",
        "series-actual": "#2a78d6",
      },
      fontFamily: {
        serif: ['"Iowan Old Style"', '"Palatino Linotype"', '"URW Palladio L"', "Georgia", "serif"],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", '"SF Mono"', '"Cascadia Code"', "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
