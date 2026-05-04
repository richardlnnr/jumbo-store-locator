import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { JumboStoreFeatureCollection } from '~~/shared/types/geojson'
import { useStoreLocator } from '~~/app/stores/useStoreLocator'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'
import {
    amsterdamCentrumFeature,
    amsterdamSouthFeature,
    eindhovenFeature,
} from '~~/shared/types/store.mock'
import SearchAutocomplete from './SearchAutocomplete.vue'

const seedThree = () => {
    const locator = useStoreLocator()
    locator.featureCollection = {
        type: 'FeatureCollection',
        features: [eindhovenFeature, amsterdamCentrumFeature, amsterdamSouthFeature],
    } satisfies JumboStoreFeatureCollection
    return locator
}

describe('SearchAutocomplete', () => {
    beforeEach(async () => {
        const locator = useStoreLocator()
        locator.featureCollection = null
        locator.clearFilters()
        locator.clearSelection()

        await setI18nLocale('en')
    })

    it('Should mount both Desktop and Mobile sub-trees together for CSS-based switching', async () => {
        seedThree()
        const wrapper = await mountWithUApp(SearchAutocomplete)

        expect(wrapper.findAll('input[type="text"]').length).toBeGreaterThanOrEqual(1)
        expect(wrapper.find('[data-slot="trigger"]').exists()).toBe(true)
    })

    it('Should expose a polite live region for screen-reader result announcements', async () => {
        seedThree()
        const wrapper = await mountWithUApp(SearchAutocomplete)

        const liveRegion = wrapper.find('[aria-live="polite"]')
        expect(liveRegion.exists()).toBe(true)
        expect(liveRegion.attributes('aria-atomic')).toBe('true')
        expect(liveRegion.classes()).toContain('sr-only')
    })

    it('Should announce the result count from the typing buffer after the debounce window', async () => {
        const locator = seedThree()
        const wrapper = await mountWithUApp(SearchAutocomplete)

        locator.setSearchTerm('amsterdam')

        await vi.waitFor(() => {
            const liveRegion = wrapper.find('[aria-live="polite"]')
            expect(liveRegion.text()).toContain('2 stores and 1 cities found')
        }, { timeout: 2000 })
    })

    it('Should announce the no-results copy when the typing buffer matches nothing', async () => {
        const locator = seedThree()
        const wrapper = await mountWithUApp(SearchAutocomplete)

        locator.setSearchTerm('xyznotamatch')

        await vi.waitFor(() => {
            const liveRegion = wrapper.find('[aria-live="polite"]')
            expect(liveRegion.text()).toContain('No stores match xyznotamatch')
        }, { timeout: 2000 })
    })

    it('Should revert the typing buffer to the applied query when the viewport breakpoint flips', async () => {
        const originalMatchMedia = window.matchMedia
        const listeners: Array<(event: { matches: boolean }) => void> = []
        const mql = {
            matches: true,
            media: '(min-width: 768px)',
            onchange: null,
            addEventListener: (event: string, listener: (event: { matches: boolean }) => void) => {
                if (event === 'change') listeners.push(listener)
            },
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        }
        window.matchMedia = (() => mql) as unknown as typeof window.matchMedia

        try {
            const locator = seedThree()
            locator.setQuery('amsterdam')
            await mountWithUApp(SearchAutocomplete)

            locator.setSearchTerm('amsterdam-typed-but-not-applied')
            expect(locator.searchTerm).toBe('amsterdam-typed-but-not-applied')

            mql.matches = false
            listeners.forEach(listener => listener({ matches: false }))

            await vi.waitFor(() => {
                expect(locator.searchTerm).toBe('amsterdam')
                expect(locator.query).toBe('amsterdam')
            }, { timeout: 1000 })
        }
        finally {
            window.matchMedia = originalMatchMedia
        }
    })
})
