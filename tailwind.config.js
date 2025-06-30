/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        green: '#00FFA8',
        white: '#FCFCFC',
        black: '#000000',
        gray: {
          light: '#F3F3F3',
          dark: '#E3E1E5',
        },
      },
      width: {
        'blocks': '90%', // w-blocks 
      },
      borderRadius: {
        'blocks': '40px', // rounded-soft
      },
    },
  },
  plugins: [],
}
