// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  app: {
    head: {
      title: 'Dreamlytics - Track & Analyze Your Dreams',
      titleTemplate: '%s | Dreamlytics',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Track, analyze, and explore your dreams with AI-powered insights' },
        { name: 'theme-color', content: '#8a2be2' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'msapplication-tap-highlight', content: 'no' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'alternate icon', type: 'image/x-icon', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/favicon.svg' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ]
    }
  },
  
  modules: ['@nuxtjs/google-fonts'],
  
  googleFonts: {
    families: {
      'Inter': [300, 400, 500, 600, 700],
      'Playfair Display': [400, 600, 700]
    }
  },

  css: ['~/assets/styles/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/variables.scss" as *;'
        }
      }
    }
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dreamlytics',
    openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
    public: {
      apiBase: '/api'
    }
  },

  nitro: {
    plugins: ['~/server/plugins/mongoose.ts'],
    // CORS configuration for mobile API access
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
          'Access-Control-Allow-Credentials': 'true',
        }
      }
    }
  }
});
