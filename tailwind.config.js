/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#FFFFFF',
        notion: {
          dark: '#191919',
          hover: '#2F2F2F',
          border: '#373737',
        }
      },
    },
  },
  plugins: [],
}