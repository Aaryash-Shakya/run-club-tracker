/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	theme: {
		extend: {
			container: {
				center: true,
			},
			colors: {
				background: '#0E0F15',
				soft: '#181C2A',
				surface: '#282F45',
				text: '#FFFFFF',
				muted: 'rgba(255,255,255,0.6)',
			},
			fontFamily: {
				inter: ['Inter', 'sans-serif'],
			},
		},
	},
	plugins: [],
}
