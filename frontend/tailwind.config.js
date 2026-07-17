export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        fluent: { DEFAULT: "#0078d4", hover: "#106ebe", pressed: "#005a9e", light: "#e6f1fb", surface: "#f3f9fd" },
        ink: { DEFAULT: "#17253d", strong: "#0e1726", muted: "#5a6b82", faint: "#8a94a3" },
        line: "#e1e1e1",
        good: "#107c10", warn: "#0078d4", bad: "#d13438",
      },
      fontFamily: {
        sans: ['"Segoe UI"', '"Segoe UI Variable"', "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: { fluent: "8px" },
    },
  },
  plugins: [],
};
