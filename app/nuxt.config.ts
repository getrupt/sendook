// https://nuxt.com/docs/api/configuration/nuxt-config
const apiUrl =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.API_URL ??
  'https://api.sendook.com';

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

  nitro: {
    externals: {
      inline: ['tailwindcss']
    }
  },

  runtimeConfig: {
    public: {
      apiUrl
    }
  }
})