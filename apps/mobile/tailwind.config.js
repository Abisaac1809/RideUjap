/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Design tokens de RideUJAP (acento esmeralda)
        primary: {
          DEFAULT: "#12b981",
          ink: "#ffffff",
        },
        ink: "#0e0f12",
        muted: "#8a9099",
        surface: "#f5f6f7",
        line: "#e7e9ec",
      },
      borderRadius: {
        control: "12px",
      },
    },
  },
  plugins: [],
};
