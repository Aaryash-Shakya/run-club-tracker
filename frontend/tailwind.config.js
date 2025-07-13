/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        // Custom colors for your leaderboard theme
        dark: {
          bg: '#0d1117',
          surface: '#1a1a1a',
          table: '#2a2a2a',
          header: '#242328',
          border: '#404040',
          text: {
            primary: '#ffffff',
            secondary: '#cccccc',
            muted: '#888888',
          },
        },
      },
    },
  },
}
