/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core discipline colors
        discipline: {
          dark: '#0a0a0b',
          darker: '#050506',
          card: '#111113',
          border: '#1f1f23',
          muted: '#71717a',
        },
        // Status colors
        safe: {
          DEFAULT: '#22c55e',
          muted: '#166534',
          bg: '#052e16',
        },
        warning: {
          DEFAULT: '#f59e0b',
          muted: '#92400e',
          bg: '#451a03',
        },
        failure: {
          DEFAULT: '#ef4444',
          muted: '#991b1b',
          bg: '#450a0a',
        },
        // Accent
        accent: {
          primary: '#8b5cf6',
          secondary: '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
