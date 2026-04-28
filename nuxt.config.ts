// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ['@nuxt/ui', '@nuxt/image', '@nuxt/fonts', '@nuxtjs/i18n', '@nuxt/test-utils/module', '@nuxt/eslint', '@vueuse/nuxt'],
    devtools: { enabled: true },
    css: ['~/assets/css/main.css', 'mapbox-gl/dist/mapbox-gl.css'],
    runtimeConfig: {
        public: {
            mapboxToken: '',
        },
    },
    routeRules: {
        '/': { redirect: '/stores' },
    },
    compatibilityDate: '2025-07-15',
    typescript: {
        tsConfig: {
            include: ['../**/*.nuxt.test.ts'],
        },
    },
    eslint: {
        config: {
            stylistic: {
                indent: 4,
                semi: false,
                quotes: 'single',
                commaDangle: 'always-multiline',
            },
        },
    },
    fonts: {
        families: [
            { name: 'JumboTheSans', provider: 'local' },
        ],
        defaults: {
            weights: [400, 700, 900],
            styles: ['normal'],
        },
    },
    i18n: {
        strategy: 'no_prefix',
        defaultLocale: 'en',
        locales: [
            { code: 'en', name: 'English', file: 'en.json' },
            { code: 'nl', name: 'Nederlands', file: 'nl.json' },
        ],
        experimental: {
            typedOptionsAndMessages: 'default',
        },
    },
})
