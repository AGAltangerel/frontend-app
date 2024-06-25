import { defineNuxtConfig } from 'nuxt/config';
import vuetify from 'vite-plugin-vuetify';

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
        port: process.env.PORT || 80, // default port 80
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
    plugins: ['~/plugins/axios.ts'],
    components: true,
    build: {
        transpile: ['vuetify'],
    },
    modules: [
        (_options, nuxt) => {
            nuxt.hook('vite:extendConfig', (config) => {
                config.plugins.push(vuetify({ autoImport: true }));
            });
        },
        
    ],
    vite: {
        optimizeDeps: {
            include: ['@mdi/js'],
        },
        vue: {
        template: {
            transformAssetUrls: {
            img: ['src', 'data-src'],
            source: 'src',
            img: 'src',
            image: 'xlink:href',
            },
        },
        },
    },
});
