/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface: '#111118',
        'surface-elevated': '#18181F',
        accent: '#6C63FF',
        'accent-secondary': '#00D9C0',
        'text-primary': '#F0F0FF',
        'text-muted': '#8B8BA7',
        border: 'rgba(255,255,255,0.08)',
        danger:  'rgb(239 68 68)',
        success: 'rgb(16 185 129)',
        warning: 'rgb(245 158 11)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'h1': ['64px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h2': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h3': ['32px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h4': ['24px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h5': ['18px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      animation: {
        'fadeUp': 'fadeUp 0.6s ease-out forwards',
        'fadeIn': 'fadeIn 0.4s ease forwards',
        'slideLeft': 'slideLeft 0.5s ease forwards',
        'scaleIn': 'scaleIn 0.4s ease forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideLeft: {
          from: { transform: 'translateX(40px)' },
          to: { transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { transform: 'scale(0.95)' },
          to: { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(108, 99, 255, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(108, 99, 255, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
