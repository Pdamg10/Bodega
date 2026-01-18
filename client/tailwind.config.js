/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',      // Azul profesional
        secondary: '#10B981',    // Verde fresco
        accent: '#60A5FA',       // Azul claro (secundario)
        background: '#F9FAFB',   // Gris muy claro
        surface: '#FFFFFF',      // Blanco
        textMain: '#1F2937',     // Gris oscuro
        textMuted: '#6B7280',    // Gris medio para textos secundarios
        borderSoft: '#E5E7EB',   // Borde sutil
      }
    },
  },
  plugins: [],
}
