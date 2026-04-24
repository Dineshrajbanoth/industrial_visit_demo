/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        ocean: '#0a4f6e',
        slateBlue: '#1e3a8a',
        mist: '#f1f5f9',
        coral: '#ff7a59',
      },
      boxShadow: {
        soft: '0 12px 30px -12px rgba(15, 23, 42, 0.2)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
