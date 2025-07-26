/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        background: {
          DEFAULT: '#0E0F15', // Main background
          soft: '#181C2A', // Cards / inner containers
          surface: '#282F45', // Slightly lighter for contrast
        },
        // Text colors
        text: {
          DEFAULT: '#FFFFFF', // Main text color
          muted: 'rgba(255,255,255,0.6)', // Muted text for less emphasis
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
