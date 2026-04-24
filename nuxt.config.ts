// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ['@nuxt/ui', '@nuxt/test-utils/module', '@nuxt/eslint'],
    devtools: { enabled: true },
    css: ['~/assets/css/main.css'],
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
