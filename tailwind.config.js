/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#07090e',
        surface: '#0f1420',
        'surface-light': '#182032',
        primary: '#38bdf8',
        'primary-glow': 'rgba(56, 189, 248, 0.4)',
        accent: '#818cf8',
        gold: '#f59e0b',
        'gold-glow': 'rgba(245, 158, 11, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)' },
          '100%': { boxShadow: '0 0 50px rgba(56, 189, 248, 0.8), 0 0 100px rgba(129, 140, 248, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
