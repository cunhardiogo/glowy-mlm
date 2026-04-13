import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        glowy: {
          primary: '#2E9D5A',
          secondary: '#A8E6C0',
          accent: '#D4F5E8',
          dark: '#1B3A25',
        },
        bronze: '#CD7F32',
        silver: '#C0C0C0',
        gold: '#D4AF37',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
