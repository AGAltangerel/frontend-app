import { defineNuxtConfig } from 'nuxt/config'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
    dev: process.env.NODE_ENV !== 'production',
    ssr: true,
    devtools: { enabled: true },
    css: ['~/assets/css/main.css'],
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    server: {
        port: process.env.PORT || 80,
        host: '0.0.0.0',
    },
    router: {
        middleware: ['auth'], // Ensure it's an array
    },
    ui: {
        container: {
            constrained: 'max-w-5xl'
        }
    },
    buildModules: [
        '@nuxt/typescript-build',
        '@nuxtjs/tailwindcss',
        '@nuxtjs/vuetify',
    ],
    plugins: ['~/plugins/axios.ts', ],
    components: true,
    build: {
        transpile: ['/^@nuxt/', 'vuetify',],
    },
    modules: [
        (_options, nuxt) => {
            nuxt.hooks.hook('vite:extendConfig', (config) => {
              // @ts-expect-error
                config.plugins.push(vuetify({ autoImport: true }))
            })
        },
    ],
    vite: {
        vue: {
            template: {
                transformAssetUrls,
            }
        }
    }
})
