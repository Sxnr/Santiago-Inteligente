/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F305B",
        navy: "#0A2540",
        navyLight: "#14365F",
        accent: "#FFC727",
        accentHover: "#FFB800",
        surface: "#F1F4F8",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
