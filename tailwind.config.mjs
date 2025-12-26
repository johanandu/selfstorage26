/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Premium dark theme
        background: '#1A1A1A',
        primary: '#4A4A4A',
        secondary: '#6A6A6A',
        accent: '#EAEAEA',
        text: {
          dark: '#1A1A1A',
          light: '#EAEAEA',
        },
      },
      fontFamily: {
        'canela': ['Canela', 'serif'],
        'haas': ['Neue Haas Grotesk', 'sans-serif'],
      },
      animation: {
        'pulse-gate': 'pulse-gate 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
      },
      keyframes: {
        'pulse-gate': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.98)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}