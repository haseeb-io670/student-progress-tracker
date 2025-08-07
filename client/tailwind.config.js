/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': '#0d1b38',
        'orange': '#f49523',
        'white': '#fafcfa',
        'navy-light': '#1a305e',
        'orange-light': '#ffb860',
        'navy-dark': '#071022',
      },
    },
  },
  plugins: [],
}
