/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Tailwind blue-600
        secondary: '#9333ea', // Tailwind purple-600
        accent: '#facc15', // Tailwind yellow-400
        neutral: '#1f2937', // Tailwind gray-800
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
