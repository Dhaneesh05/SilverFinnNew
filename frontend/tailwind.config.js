/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        metallic: {
          900: '#0A0C0F', // Main background (Darkest)
          800: '#14171A', // Secondary surface (Cards/Panels)
          700: '#23282D', // Tertiary / borders
          600: '#343A40',
        },
        gold: {
          400: '#E6C27A',
          500: '#D4AF37', // Brand Accent
          600: '#AA8C2C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
