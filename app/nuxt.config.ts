// https://nuxt.com/docs/api/configuration/nuxt-config
const apiUrl =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.API_URL ??
  'http://localhost:8006';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui'
  ],

  css: ['~/assets/css/tailwind.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  runtimeConfig: {
    public: {
      apiUrl
    }
  }
})