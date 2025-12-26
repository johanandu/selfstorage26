/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // V2 Dark Theme - Deeper blacks
        background: '#0a0a0a',
        'bg-primary': '#1a1a1a',
        'bg-secondary': '#2a2a2a',
        accent: '#f5f5f5',
        text: {
          dark: '#0a0a0a',
          light: '#f5f5f5',
        },
        glass: {
          bg: 'rgba(42, 42, 42, 0.1)',
          border: 'rgba(245, 245, 245, 0.1)',
        },
      },
      fontFamily: {
        'display': ['Inter Display', 'Inter', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-gate': 'pulse-gate 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
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
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: '200px 0' },
        },
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
      },
    },
  },
  plugins: [],
}