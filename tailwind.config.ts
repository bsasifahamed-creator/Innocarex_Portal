import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-blue": "#0754EA",
        "brand-teal": "#02B387",
        primary: "#0754EA",
        "dark-navy": "#081B40",
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.1)" },
        },
      },
      animation: {
        "gradient-x": "gradient-x 3s ease infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents, addUtilities }) {
      addComponents({
        ".glass-card": {
          backgroundColor: "rgba(255, 255, 255, 0.60)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255, 255, 255, 0.40)",
          boxShadow:
            "0 4px 24px 0 rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
        },
        ".section-spacing": {
          paddingTop: "6rem",
          paddingBottom: "6rem",
          "@screen md": {
            paddingTop: "8rem",
            paddingBottom: "8rem",
          },
        },
      });
      addUtilities({
        ".mask-linear-fade": {
          maskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        },
        ".bg-size-200": {
          backgroundSize: "200% 200%",
        },
      });
    }),
  ],
};

export default config;
