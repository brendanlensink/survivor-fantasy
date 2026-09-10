import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Tribal Council" theme: charcoal/wood backgrounds, torch-orange +
        // blood-red accents, cream text. See src/lib/tribeColors.ts for the
        // per-tribe badge palette.
        wood: {
          950: "#120d09",
          900: "#1a1410",
          800: "#211a13",
          700: "#2a2118",
          600: "#3a2f22",
          500: "#584a37",
        },
        ember: {
          DEFAULT: "#e8791a",
          light: "#f0954a",
          dark: "#c96513",
        },
        blood: "#b23a1f",
        parchment: {
          DEFAULT: "#f0e6d2",
          muted: "#c9bfae",
          dim: "#8f8270",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
