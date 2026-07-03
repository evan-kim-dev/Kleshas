/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: "#00f5ff",
          pink: "#ff2d95",
          purple: "#b026ff",
        },
        void: {
          DEFAULT: "#0a0a0f",
          card: "#12121a",
          border: "#1e1e2e",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 245, 255, 0.3)",
        "neon-pink": "0 0 20px rgba(255, 45, 149, 0.3)",
      },
      animation: {
        pulse_neon: "pulse_neon 2s ease-in-out infinite",
      },
      keyframes: {
        pulse_neon: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
