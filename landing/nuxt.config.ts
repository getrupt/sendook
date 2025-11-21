// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots'
  ],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      title: 'sendook',
      meta: [
        { name: 'description', content: 'sendook - Email infrastructure for developers' }
      ],
      link: [
        // Inter font from design.json typography
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap' }
      ]
    }
  },

  site: {
    url: 'https://www.sendook.com'
  },

  css: ['~/assets/css/main.css'],

  ui: {
    colorMode: false
  },

  routeRules: {
    '/docs': { redirect: '/docs/getting-started', prerender: false }
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
