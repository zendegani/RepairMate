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
        ink: "#17211f",
        mint: "#c8f6df",
        repair: "#176b58",
        copper: "#c56f3d",
        graphite: "#283633",
      },
      boxShadow: {
        panel: "0 18px 60px rgba(23, 33, 31, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
