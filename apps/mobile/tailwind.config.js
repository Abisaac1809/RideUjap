/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Design tokens de RideUJAP: teal de marca + acento coral, neutros cálidos.
        // La familia primary depende del portal activo: los valores salen de
        // variables CSS (canales RGB) definidas en global.css y sobrescritas
        // con `vars()` desde la raíz de la app.
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          dark: "rgb(var(--color-primary-dark) / <alpha-value>)",
          tint: "rgb(var(--color-primary-tint) / <alpha-value>)",
          ink: "rgb(var(--color-primary-ink) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "#ff6b4a",
          tint: "#ffede8",
        },
        ink: "#1a1614",
        muted: "#8a827d",
        subtle: "#9a938d",
        surface: "#faf8f6",
        line: "#ece7e3",
      },
      borderRadius: {
        control: "14px",
      },
      fontFamily: {
        // Sora (geométrica, tech). Cada peso es un archivo aparte y se expone
        // como familia propia. NO usar las clases de peso de Tailwind
        // (font-bold, etc.) sobre estas: en Android el sistema sintetizaría un
        // bold falso encima del archivo ya-bold. Elegir el peso vía familia.
        sans: ["Sora_400Regular"],
        "sora-medium": ["Sora_500Medium"],
        "sora-semibold": ["Sora_600SemiBold"],
        "sora-bold": ["Sora_700Bold"],
      },
      fontSize: {
        // Escala tipográfica con line-height propio para más aire y jerarquía.
        display: ["30px", { lineHeight: "36px" }],
        title: ["22px", { lineHeight: "28px" }],
        subtitle: ["17px", { lineHeight: "24px" }],
      },
    },
  },
  plugins: [],
};
