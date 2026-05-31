/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        luxe: {
          black: "#070707",
          panel: "#101010",
          line: "#2a241d",
          gold: "#d8ad5f",
          muted: "#b9aa95"
        }
      }
    }
  },
  plugins: []
};
