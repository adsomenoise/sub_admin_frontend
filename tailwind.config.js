/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'main-dark': '#440873',
        'secondary-light': '#E3E1E5',
        'secondary-dark': '#666666',
        'accent-green': '#00FFA8',
      },
      spacing: {
        'blocks': '90%',
      },
      borderRadius: {
        'blocks': '2rem',
      },
      screens: {
        '3xl': '1600px',
      },
    },
  },
  plugins: [],
}