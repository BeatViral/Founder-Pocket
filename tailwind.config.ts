import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0d1117",
        coal: "#151a21",
        paper: "#f8fafc",
        line: "rgba(148, 163, 184, 0.22)",
        signal: "#38bdf8",
        violet: "#8b5cf6",
        mint: "#34d399",
        amber: "#f59e0b"
      },
      boxShadow: {
        glow: "0 24px 90px rgba(56, 189, 248, 0.18)",
        panel: "0 22px 70px rgba(2, 6, 23, 0.34)",
        premium: "0 28px 90px rgba(2, 6, 23, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        "premium-light": "0 22px 58px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.92)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
} satisfies Config;
