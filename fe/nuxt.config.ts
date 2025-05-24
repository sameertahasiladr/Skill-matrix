import { defineNuxtConfig } from 'nuxt/config'
 
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: [
      '@nuxtjs/tailwindcss',
      '@nuxtjs/google-fonts',
      '@nuxt/icon',
      '@nuxt/image',
      '@pinia/nuxt',
    ],
    app: {
        head: {
            link: [
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Montserrat&display=swap'
                }
            ]
        }
    },
    runtimeConfig: {
      public: {
        apiBase: process.env.API_BASE_URL || 'http://localhost:4000',
      },
    },
    // Remove routeRules with appMiddleware and instead handle middleware in your pages or /middleware folder
    nitro: {
      devProxy: {
        '/api': {
          target: process.env.API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    compatibilityDate: '2025-02-27',
    build: {
      transpile: ['vue3-d3-tree']
    }
 
  })  