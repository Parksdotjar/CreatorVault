import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./styles/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          50: "#f9f5ff",
          100: "#efe7ff",
          200: "#dacaff",
          300: "#bea1ff",
          400: "#a578ff",
          500: "#8b4dff",
          600: "#7537e6",
          700: "#5f2cc0",
          800: "#4b2491",
          900: "#371c66",
        },
        accent: {
          400: "#ff75e5",
          500: "#ff4fd8",
          600: "#f012c8",
        },
        space: {
          900: "#090913",
          950: "#05060b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Orbitron", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 22px rgba(255, 79, 216, 0.35)",
        "glow-lg": "0 0 40px rgba(255, 79, 216, 0.55)",
        voxel: "0 8px 0 rgba(0,0,0,0.35)",
      },
      borderRadius: {
        voxel: "14px",
        "voxel-lg": "22px",
      },
      backgroundImage: {
        "space-radial":
          "radial-gradient(circle at top, rgba(139,77,255,0.25), transparent 55%)",
        "pixel-grid":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        "pixel-grid": "24px 24px",
      },
      keyframes: {
        "page-in": {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "voxel-jitter": {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(1px, -1px, 0)" },
        },
        "block-build": {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "60%": { opacity: "1", transform: "scale(1.05)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 rgba(255,79,216,0)" },
          "50%": { boxShadow: "0 0 22px rgba(255,79,216,0.55)" },
        },
      },
      animation: {
        "page-in": "page-in 240ms ease-out",
        "voxel-jitter": "voxel-jitter 220ms steps(2, end)",
        "block-build": "block-build 480ms ease-out",
        "glow-pulse": "glow-pulse 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
