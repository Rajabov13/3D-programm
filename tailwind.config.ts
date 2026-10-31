import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#03060d',
          900: '#060b16',
          850: '#0a1120',
          800: '#0d1628',
          700: '#142036',
          600: '#1c2b46',
        },
        graphite: {
          900: '#0f1115',
          800: '#171a21',
          700: '#22262f',
          600: '#2e333e',
        },
        cyan: {
          glow: '#5ce1ff',
        },
        accent: {
          violet: '#8b7cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glass: '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 20px 50px -20px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(92,225,255,0.25), 0 8px 30px -8px rgba(56,189,248,0.35)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'star-pop': {
          '0%': { transform: 'scale(0) rotate(-40deg)', opacity: '0' },
          '70%': { transform: 'scale(1.35) rotate(8deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-out both',
        'rise-in': 'rise-in 400ms cubic-bezier(.2,.8,.2,1) both',
        'star-pop': 'star-pop 500ms cubic-bezier(.2,.8,.2,1) both',
        shake: 'shake 400ms ease-in-out',
        'pop-in': 'pop-in 250ms cubic-bezier(.2,.8,.2,1) both',
        float: 'float 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
