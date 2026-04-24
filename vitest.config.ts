import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
    test: {
        globals: true,
        passWithNoTests: true,
        projects: [
            {
                test: {
                    name: 'unit',
                    include: ['**/*.test.ts'],
                    exclude: [
                        '**/*.nuxt.test.ts',
                        '**/node_modules/**',
                        '.nuxt/**',
                        '.output/**',
                        'dist/**',
                    ],
                    environment: 'node',
                },
            },
            await defineVitestProject({
                test: {
                    name: 'nuxt',
                    include: ['**/*.nuxt.test.ts'],
                    exclude: ['**/node_modules/**', '.nuxt/**', '.output/**', 'dist/**'],
                    environment: 'nuxt',
                },
            }),
        ],
    },
})
