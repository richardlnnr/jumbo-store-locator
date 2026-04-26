// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ['@nuxt/ui', '@nuxt/image', '@nuxt/fonts', '@nuxt/test-utils/module', '@nuxt/eslint', '@vueuse/nuxt'],
    devtools: { enabled: true },
    css: ['~/assets/css/main.css', 'mapbox-gl/dist/mapbox-gl.css'],
    runtimeConfig: {
        public: {
            mapboxToken: '',
        },
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
})
