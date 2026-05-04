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
import SearchAutocompleteMobile from './Mobile.vue'

const seedAmsterdamThree = () => {
    const locator = useStoreLocator()
    locator.featureCollection = {
        type: 'FeatureCollection',
        features: [eindhovenFeature, amsterdamCentrumFeature, amsterdamSouthFeature],
    } satisfies JumboStoreFeatureCollection
    return locator
}

describe('SearchAutocompleteMobile', () => {
    beforeEach(async () => {
        const locator = useStoreLocator()
        locator.featureCollection = null
        locator.clearFilters()
        locator.clearSelection()

        await setI18nLocale('en')
    })

    it('Should render the trigger button with the placeholder when the query is empty', async () => {
        seedAmsterdamThree()
        const wrapper = await mountWithUApp(SearchAutocompleteMobile)

        const trigger = wrapper.find('[data-slot="trigger"]')
        expect(trigger.exists()).toBe(true)
        expect(trigger.text()).toContain('Search by name or city...')
        expect(trigger.attributes('aria-label')).toBe('Open search')
        expect(trigger.attributes('aria-expanded')).toBe('false')
    })

    it('Should reflect the active query in the collapsed trigger label', async () => {
        const locator = seedAmsterdamThree()
        locator.setQuery('Amsterdam')
        const wrapper = await mountWithUApp(SearchAutocompleteMobile)

        expect(wrapper.find('[data-slot="trigger"]').text()).toContain('Amsterdam')
    })

    it('Should open the modal when the trigger is tapped', async () => {
        seedAmsterdamThree()
        const wrapper = await mountWithUApp(SearchAutocompleteMobile)

        await wrapper.find('[data-slot="trigger"]').trigger('click')

        await vi.waitFor(() => {
            expect(document.querySelector('[data-slot="suggestions"]')).not.toBeNull()
        }, { timeout: 1000 })
    })

    it('Should populate the modal listbox with grouped suggestions as the user types', async () => {
        const locator = seedAmsterdamThree()
        const wrapper = await mountWithUApp(SearchAutocompleteMobile)
        await wrapper.find('[data-slot="trigger"]').trigger('click')

        locator.setSearchTerm('amsterdam')

        await vi.waitFor(() => {
            const body = document.body.innerHTML
            expect(body).toContain('Stores')
            expect(body).toContain(amsterdamCentrumFeature.properties.name)
            expect(body).toContain(amsterdamSouthFeature.properties.name)
        }, { timeout: 2000 })
        expect(locator.query).toBe('')
    })

    it('Should commit the typing buffer to the applied query when a row is tapped', async () => {
        const locator = seedAmsterdamThree()
        const wrapper = await mountWithUApp(SearchAutocompleteMobile)
        await wrapper.find('[data-slot="trigger"]').trigger('click')
        locator.setSearchTerm('amsterdam')

        await vi.waitFor(() => {
            expect(document.body.innerHTML).toContain(amsterdamCentrumFeature.properties.name)
        }, { timeout: 2000 })

        const firstStoreRow = document.querySelector('[data-slot="suggestions"] [data-slot="suggestion-row"]')
        expect(firstStoreRow).not.toBeNull()
        ;(firstStoreRow as HTMLElement).click()

        await vi.waitFor(() => {
            expect(locator.query).toBe(amsterdamCentrumFeature.properties.name)
        }, { timeout: 2000 })
    })

    it('Should revert the typing buffer to the applied query when the modal closes without committing', async () => {
        const locator = seedAmsterdamThree()
        locator.setQuery('amsterdam')
        const wrapper = await mountWithUApp(SearchAutocompleteMobile)
        await wrapper.find('[data-slot="trigger"]').trigger('click')

        locator.setSearchTerm('xyz')
        const backButton = document.body.querySelector('[aria-label="Close search"]') as HTMLButtonElement | null
        expect(backButton).not.toBeNull()
        backButton?.click()

        await vi.waitFor(() => {
            expect(locator.searchTerm).toBe('amsterdam')
            expect(locator.query).toBe('amsterdam')
        }, { timeout: 2000 })
    })
})
