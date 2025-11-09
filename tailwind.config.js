/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nordic Natural Theme
        beige: {
          50: '#FEFDFB',
          100: '#FAF7F2',
          200: '#F5F0E8',
          300: '#EBE4D8',
        },
        nordic: {
          green: '#9BBF9E',
          'green-dark': '#7FA882',
          'green-light': '#B8D4BA',
        },
        gray: {
          text: '#3E3E3E',
          light: '#8E8E8E',
        }
      },
      borderRadius: {
        'nordic': '16px',
      },
      boxShadow: {
        'nordic': '0 2px 8px rgba(62, 62, 62, 0.08)',
        'nordic-lg': '0 4px 16px rgba(62, 62, 62, 0.12)',
      }
    },
  },
  plugins: [],
}
