import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        housing: "#0b1311",
        panel: "#101a17",
        raised: "#15211d",
        chalk: "#e7efe9",
        muted: "#7b918a",
        signal: "#39d98a",
        caution: "#e8a24a",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 24px 50px -28px rgba(0, 0, 0, 0.7)",
        signal: "0 0 0 1px rgba(57, 217, 138, 0.35), 0 0 22px -4px rgba(57, 217, 138, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
