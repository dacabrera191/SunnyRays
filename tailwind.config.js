/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#fdf6ee',
        warmwhite: '#fffaf4',
        terracotta: '#c4704f',
        'terracotta-light': '#e8956d',
        brown: '#5c3d2e',
        'brown-light': '#8c6a57',
        sage: '#8aab8a',
        'sage-light': '#c2d9c2',
      },
      fontFamily: {
        lora: ['Lora', 'serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
