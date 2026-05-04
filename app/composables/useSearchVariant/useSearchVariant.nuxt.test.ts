import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const routeStub = vi.hoisted(() => ({
    current: { query: {} as Record<string, string | string[] | undefined> },
}))

mockNuxtImport('useRoute', () => () => routeStub.current)

const { useSearchVariant } = await import('./useSearchVariant')

describe('useSearchVariant', () => {
    beforeEach(() => {
        routeStub.current = { query: {} }
    })

    it('Should return autocomplete when the search query param is absent', () => {
        expect(useSearchVariant().value).toBe('autocomplete')
    })

    it('Should return legacy when the search query param equals "legacy"', () => {
        routeStub.current = { query: { search: 'legacy' } }

        expect(useSearchVariant().value).toBe('legacy')
    })

    it('Should fall back to autocomplete for any other search query value', () => {
        routeStub.current = { query: { search: 'something-else' } }

        expect(useSearchVariant().value).toBe('autocomplete')
    })
})
