import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#00e87b',
        'accent-hover': '#00ff88',
        surface: '#161616',
        'surface-alt': '#111111',
        bg: '#0a0a0a',
      },
      fontFamily: {
        mono: ['Geist Mono', 'SF Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        cursorBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        cardPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 232, 123, 0.06), 0 0 50px rgba(0, 232, 123, 0.03)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 232, 123, 0.1), 0 0 60px rgba(0, 232, 123, 0.05)' },
        },
      },
      animation: {
        'cursor-blink': 'cursorBlink 1s step-end infinite',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'card-pulse': 'cardPulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
