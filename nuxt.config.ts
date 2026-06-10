import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
  ],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_ENV_AXIOS_BASE_URL || 'http://localhost:8080',
      firebaseApiKey: process.env.NUXT_FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.NUXT_FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.NUXT_FIREBASE_PROJECT_ID || '',
      firebaseMessagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.NUXT_FIREBASE_APP_ID || '',
    },
  },

  css: [
    '@fortawesome/fontawesome-free/css/fontawesome.css',
    '@fortawesome/fontawesome-free/css/brands.css',
    '@fortawesome/fontawesome-free/css/regular.css',
    '@fortawesome/fontawesome-free/css/solid.css',
    '~/assets/css/main.css',
  ],

  ssr: false,

  components: [
    { path: '~/components', pathPrefix: false, extensions: ['vue'] },
  ],

  imports: {
    dirs: ['stores', 'composables', 'utils'],
  },

  i18n: {
    locales: [
      { code: 'vi', file: 'vi.json', name: 'Tiếng Việt' },
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'ja', file: 'ja.json', name: '日本語' },
    ],
    defaultLocale:  'vi',
    langDir:        'locales/',
    strategy:       'no_prefix',
    restructureDir: false,
    bundle: {
      optimizeTranslationDirective: false,
    },
    detectBrowserLanguage: false,
  },

  plugins: [
    '~/plugins/dayjs.client.ts',
    '~/plugins/vee-validate.client.ts',
    '~/plugins/firebase.client.ts',
    '~/plugins/api.client.ts',
    '~/plugins/auth.client.ts',
  ],

  app: {
    head: {
      title: 'Micro ERP',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap' },
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['chart.js'],
    },
  },

  compatibilityDate: '2024-09-01',
})
