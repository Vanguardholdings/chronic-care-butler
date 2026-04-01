import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        healthcare: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8eccff",
          400: "#59b0ff",
          500: "#338dff",
          600: "#1b6ff5",
          700: "#1459e1",
          800: "#1748b6",
          900: "#193f8f",
          950: "#142857",
        },
        mint: {
          50: "#effef4",
          100: "#d9fee6",
          200: "#b5fbce",
          300: "#7cf7a9",
          400: "#3ce97d",
          500: "#14d15c",
          600: "#09ad49",
          700: "#0b883d",
          800: "#0f6b34",
          900: "#0e582d",
          950: "#013116",
        },
        dark: {
          50: "#f6f6f9",
          100: "#ededf1",
          200: "#d7d8e0",
          300: "#b4b5c5",
          400: "#8b8da5",
          500: "#6d6f8a",
          600: "#575972",
          700: "#47485d",
          800: "#3d3e4f",
          900: "#1a1b2e",
          950: "#0d0e1a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(51, 141, 255, 0.3)",
        "glow-green": "0 0 20px rgba(20, 209, 92, 0.3)",
        "3d": "0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.2)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;