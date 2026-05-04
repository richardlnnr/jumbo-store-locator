import { nextTick } from 'vue'
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
import SearchAutocompleteDesktop from './Desktop.vue'

const seedAmsterdamThree = () => {
    const locator = useStoreLocator()
    locator.featureCollection = {
        type: 'FeatureCollection',
        features: [eindhovenFeature, amsterdamCentrumFeature, amsterdamSouthFeature],
    } satisfies JumboStoreFeatureCollection
    return locator
}

describe('SearchAutocompleteDesktop', () => {
    beforeEach(async () => {
        const locator = useStoreLocator()
        locator.featureCollection = null
        locator.clearFilters()
        locator.clearSelection()

        await setI18nLocale('en')
    })

    it('Should render the placeholder from the search-autocomplete surface', async () => {
        seedAmsterdamThree()
        const wrapper = await mountWithUApp(SearchAutocompleteDesktop)

        expect(wrapper.html()).toContain('Search by name or city...')
    })

    it('Should write to the typing buffer (searchTerm) and leave query untouched while the user types', async () => {
        const locator = seedAmsterdamThree()
        const wrapper = await mountWithUApp(SearchAutocompleteDesktop)

        const input = wrapper.find('input[type="text"]')
        await input.setValue('amsterdam')

        expect(locator.searchTerm).toBe('amsterdam')
        expect(locator.query).toBe('')
    })

    it('Should not render a chevron icon in the trailing slot', async () => {
        seedAmsterdamThree()
        const wrapper = await mountWithUApp(SearchAutocompleteDesktop)

        expect(wrapper.find('[class*="i-lucide:chevron"]').exists()).toBe(false)
    })

    it('Should render a clear button when the typing buffer is non-empty', async () => {
        const locator = seedAmsterdamThree()
        const wrapper = await mountWithUApp(SearchAutocompleteDesktop)

        const findClearStyle = () =>
            wrapper.find('button[aria-label="Clear search"]').attributes('style') ?? ''

        expect(findClearStyle()).toContain('display: none')

        locator.setSearchTerm('amst')
        await nextTick()

        expect(findClearStyle()).not.toContain('display: none')
    })

    it('Should commit an empty filter when the clear button is clicked', async () => {
        const locator = seedAmsterdamThree()
        locator.setSearchTerm('amsterdam')
        locator.applySearchTerm()
        const wrapper = await mountWithUApp(SearchAutocompleteDesktop)

        await wrapper.find('button[aria-label="Clear search"]').trigger('click')

        expect(locator.searchTerm).toBe('')
        expect(locator.query).toBe('')
    })

    it('Should render the Stores group label and store names in the teleported popover content as the user types', async () => {
        const locator = seedAmsterdamThree()
        await mountWithUApp(SearchAutocompleteDesktop)

        locator.setSearchTerm('amsterdam')

        await vi.waitFor(() => {
            const body = document.body.innerHTML
            expect(body).toContain('Stores')
            expect(body).toContain(amsterdamCentrumFeature.properties.name)
            expect(body).toContain(amsterdamSouthFeature.properties.name)
        }, { timeout: 2000 })
    })

    it('Should render the empty-state copy when the typing buffer matches no stores', async () => {
        const locator = seedAmsterdamThree()
        await mountWithUApp(SearchAutocompleteDesktop)

        locator.setSearchTerm('xyznotamatch')

        await vi.waitFor(() => {
            expect(document.body.innerHTML).toContain('No stores match xyznotamatch')
        }, { timeout: 2000 })
    })

    it('Should not open its teleported popover when the viewport is below the desktop breakpoint', async () => {
        const originalMatchMedia = window.matchMedia
        window.matchMedia = ((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        })) as typeof window.matchMedia

        try {
            const locator = seedAmsterdamThree()
            const wrapper = await mountWithUApp(SearchAutocompleteDesktop)

            locator.setSearchTerm('amsterdam')

            await new Promise(resolve => setTimeout(resolve, 100))

            const input = wrapper.find('input[type="text"]')
            expect(input.attributes('aria-expanded')).toBe('false')
        }
        finally {
            window.matchMedia = originalMatchMedia
        }
    })
})
