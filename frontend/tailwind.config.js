/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#004532",
        "primary-container": "#065F46",
        "on-surface": "#1b1c1a",
        outline: "#6f7973",
        surface: "#fbf9f5",
        "surface-container-low": "#f5f3ef",
        "outline-variant": "#bec9c2",
        "lotus-pink": "#F472B6",
        "modern-gold": "#D4AF37",
        background: "#FDFBF7",
        ink: "#1b1c1a",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Noto Serif KR", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "sans-serif"],
      },
      fontSize: {
        "headline-lg-mobile": ["28px", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-md": ["22px", { lineHeight: "1.3", fontWeight: "600" }],
        "quote-scripture": ["20px", { lineHeight: "1.7", fontWeight: "400" }],
        body: ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        label: ["12px", { lineHeight: "1", letterSpacing: "0.15em", fontWeight: "600" }],
        caption: ["12px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      spacing: {
        gutter: "16px",
        "container-margin": "24px",
      },
      maxWidth: {
        content: "448px",
        header: "960px",
      },
      borderRadius: {
        xl: "0.75rem",
      },
      boxShadow: {
        "mz-soft": "0 4px 12px rgba(6, 95, 70, 0.05)",
        "mz-nav": "0 -4px 12px rgba(6, 95, 70, 0.03)",
      },
      transitionDuration: {
        zen: "300ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
