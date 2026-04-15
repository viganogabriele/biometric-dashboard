/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#05070b",
          900: "#090d14",
          850: "#101722",
          800: "#172230",
        },
        signal: {
          up: "#4ade80",
          down: "#fb7185",
          neutral: "#f59e0b",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["IBM Plex Sans", "sans-serif"],
      },
      boxShadow: {
        panel: "0 10px 40px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
