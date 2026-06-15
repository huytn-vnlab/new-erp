import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: false,
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/fonts',
    '@nuxt/eslint',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_ENV_AXIOS_BASE_URL || 'http://localhost:8080',
    },
  },

  typescript: { strict: true, typeCheck: false },

  fonts: {
    families: [
      { name: 'Plus Jakarta Sans', provider: 'google', weights: [400, 500, 600, 700, 800] },
      { name: 'Noto Sans JP', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Lora', provider: 'google', weights: [400, 500, 600], styles: ['normal', 'italic'] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500] },
    ],
  },

  i18n: {
    locales: [
      { code: 'vi', file: 'vi.json', name: 'Tiếng Việt' },
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'ja', file: 'ja.json', name: '日本語' },
    ],
    defaultLocale: 'vi',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
    bundle: { optimizeTranslationDirective: false },
  },

  app: {
    head: {
      title: 'Micro ERP',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  vite: { plugins: [tailwindcss()] },
})
