/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#137fec',
        'background-light': '#f6f7f8',
        'background-dark': '#101922',
        'text-light-primary': '#111418',
        'text-light-secondary': '#617589',
        'text-dark-primary': '#f0f2f4',
        'text-dark-secondary': '#9ba5b1',
        'card-light': '#ffffff',
        'card-dark': '#1a242f',
        'border-light': '#f0f2f4',
        'border-dark': '#2c3846',
        mention: '#ffc107',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],
}
