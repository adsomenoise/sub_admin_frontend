/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        green: '#008000',
        red: '#ff0000',
        black: '#000000',
        white: '#ffffff',
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
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1720px',
    },
  },
  plugins: [],
}
