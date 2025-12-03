/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#faf7f0',
        surface: '#ffffff',
        surfaceSoft: '#f4efe6',
        surfaceHighlight: '#fff9f0',
        accent: '#43cf6e',
        accentMuted: '#2c9c53',
        accentSoft: '#d9f7e6',
        accentGlow: '#bdf3cc',
        success: '#2c9c53',
        danger: '#ef4444',
        warning: '#f59e0b',
        textPrimary: '#1b2b23',
        textMuted: '#5a6b62'
      },
      boxShadow: {
        glass: '0 28px 60px -28px rgba(67, 207, 110, 0.45)',
        surface: '0 24px 55px -32px rgba(27, 43, 35, 0.35)',
        soft: '0 18px 45px -30px rgba(67, 207, 110, 0.3)'
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
