import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

// Pin the test timezone so date-sensitive logic (store opening hours,
// "open now / closed" labels) produces the same result on every machine —
// dev laptops in Brazil, CI runners in UTC, and reviewers in NL.
process.env.TZ = 'Europe/Amsterdam'

export default defineConfig({
    test: {
        globals: true,
        passWithNoTests: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            reportsDirectory: 'coverage',
            include: ['app/**/*.{ts,vue}', 'server/**/*.ts', 'shared/**/*.ts'],
            exclude: [
                '**/*.test.ts',
                '**/*.nuxt.test.ts',
                '**/*.mock.ts',
                '**/*.config.*',
                '.nuxt/**',
                '.output/**',
            ],
        },
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
