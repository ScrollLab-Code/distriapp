/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef3c7',
          100: '#fde68a',
          500: '#d97706',
          600: '#b45309',
          700: '#9a6010',
          800: '#78350f',
        },
      },
      fontFamily: {
        mono: ["'Courier New'", 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
}
