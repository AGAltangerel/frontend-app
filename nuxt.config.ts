import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  dev: process.env.NODE_ENV !== 'production',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/tailwindcss',
  ],
  plugins: [ '~/plugins/axios.ts' ],
  components: true,
  build: { 
    transpile: ['/^@nuxt/']
  },
})