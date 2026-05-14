export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@pinia/nuxt'
  ],

  nitro: {
    preset: 'cloudflare-pages'
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'ko' },
      title: '맑은 메시징',
      titleTemplate: '%s · 맑은 메시징',
      meta: [
        { name: 'description', content: '맑은 메시징 — (주)맑은소프트의 통합 메시징 서비스' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap'
        }
      ]
    }
  },

  runtimeConfig: {
    public: {
      // NUXT_PUBLIC_API_BASE_URL 환경변수로 자동 override됨
      apiBaseUrl: '/api'
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  },

  vite: {
    server: {
      hmr: { overlay: true }
    }
  }
})
