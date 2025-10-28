// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
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
    plugins: ['~/server/plugins/mongoose.ts']
  }
});
