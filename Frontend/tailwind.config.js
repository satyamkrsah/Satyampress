/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          light: '#222222',
          dark: '#000000',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E8C547',
          dark: '#B8962E',
        },
        secondary: {
          DEFAULT: '#000000',
          light: '#222222',
          dark: '#000000',
        },
        cream: {
          DEFAULT: '#FFFFFF',
          dark: '#FAFAFA',
        },
        background: {
          light: '#FFFFFF',
          dark: '#0A0A0A',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#000000',
        },
        gray: {
          50: '#FFFFFF',
          100: 'rgba(0,0,0,0.05)',
          200: 'rgba(0,0,0,0.1)',
          300: 'rgba(0,0,0,0.2)',
          400: 'rgba(0,0,0,0.4)',
          500: 'rgba(0,0,0,0.5)',
          600: 'rgba(0,0,0,0.6)',
          700: 'rgba(255,255,255,0.2)',
          800: 'rgba(255,255,255,0.1)',
          900: 'rgba(255,255,255,0.05)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      }
    },
  },
  plugins: [],
}
