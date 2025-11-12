import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        sendook: {
          50: '#f4f5ff',
          100: '#e4e7ff',
          200: '#c8c9ff',
          300: '#a3a3ff',
          400: '#7f7efe',
          500: '#6366f1',
          600: '#4b4dd4',
          700: '#3e3fb3',
          800: '#353790',
          900: '#2f316f',
          950: '#1d1f46'
        }
      },
      boxShadow: {
        glass: '0 35px 80px rgba(15, 15, 35, 0.45)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config;

