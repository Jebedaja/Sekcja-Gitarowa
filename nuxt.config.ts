// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    
  ],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_SUPABASE_URL,
      supabaseKey: process.env.NUXT_SUPABASE_KEY
    }
  },

  css: [
    '@/assets/css/tailwind.css'
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // SSR tutaj, 
  ssr: false,

  vite: {
    optimizeDeps: {
      exclude: ['@coderline/alphatab']
    },
   // build: {
    //  rollupOptions: {
      //  output: {
       //   manualChunks: {
        //    alphatab: ['@coderline/alphatab']
        //  }
       // }
     // }
   // }
  }
})
