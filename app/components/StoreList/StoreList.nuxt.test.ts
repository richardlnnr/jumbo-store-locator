import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useStoreLocator } from '~~/app/stores/useStoreLocator'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'
import {
    amsterdamCentrumFeature,
    amsterdamSouthFeature,
    eindhovenFeature,
} from '~~/shared/types/store.mock'
import StoreList from './StoreList.vue'

const seedThreeFeatures = () => {
    const locator = useStoreLocator()
    locator.featureCollection = {
        type: 'FeatureCollection',
        features: [amsterdamCentrumFeature, amsterdamSouthFeature, eindhovenFeature],
    }
    return locator
}

const buildMatchMedia = (matches: boolean) => (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
}) as MediaQueryList

const stubMatchMedia = (matches: boolean) => {
    vi.stubGlobal('matchMedia', vi.fn(buildMatchMedia(matches)))
}

describe('StoreList', () => {
    beforeEach(async () => {
        const locator = useStoreLocator()
        locator.flushPendingSelection()
        locator.clearSelection()
        locator.featureCollection = null
        locator.clearFilters()
        locator.setMobileView('list')

        stubMatchMedia(true)

        await setI18nLocale('en')
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(new Date('2026-04-29T10:00:00+02:00'))
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.unstubAllGlobals()
    })

    it('Should expose a region landmark with the provided aria-label', async () => {
        seedThreeFeatures()
        const wrapper = await mountWithUApp(StoreList, { 'aria-label': 'Store list' })

        const aside = wrapper.find('aside')
        expect(aside.exists()).toBe(true)
        expect(aside.attributes('role')).toBe('region')
        expect(aside.attributes('aria-label')).toBe('Store list')
    })

    it('Should render the result count from filteredFeatureCollection', async () => {
        seedThreeFeatures()
        const wrapper = await mountWithUApp(StoreList)

        expect(wrapper.text()).toContain('3 stores in the Netherlands')
    })

    it('Should reflect filter changes in the result count', async () => {
        const locator = seedThreeFeatures()
        const wrapper = await mountWithUApp(StoreList)

        locator.setQuery('Eindhoven')
        await vi.waitFor(() => {
            expect(wrapper.text()).toContain('1 stores in the Netherlands')
        })
    })

    it('Should write to the Pinia query when the user types in the search input', async () => {
        const locator = seedThreeFeatures()
        const wrapper = await mountWithUApp(StoreList)

        const input = wrapper.find('input[type="text"]')
        await input.setValue('amsterdam')

        expect(locator.query).toBe('amsterdam')
    })

    it('Should toggle openOnly in the Pinia store when the Open now chip is clicked', async () => {
        const locator = seedThreeFeatures()
        const wrapper = await mountWithUApp(StoreList)

        const openNowChip = wrapper.findAll('button').find((button: { text: () => string }) => button.text().includes('Open now'))
        expect(openNowChip).toBeDefined()

        await openNowChip!.trigger('click')
        expect(locator.openOnly).toBe(true)

        await openNowChip!.trigger('click')
        expect(locator.openOnly).toBe(false)
    })

    it('Should show the city count badge when the Pinia cityFilter is populated', async () => {
        const locator = seedThreeFeatures()
        locator.setCityFilter(['Amsterdam', 'Eindhoven'])

        const wrapper = await mountWithUApp(StoreList)

        const badge = wrapper.find('[data-slot="city-count"]')
        expect(badge.exists()).toBe(true)
        expect(badge.text()).toBe('2')
    })

    it('Should select the store synchronously and leave mobileView untouched on desktop', async () => {
        const locator = seedThreeFeatures()
        const wrapper = await mountWithUApp(StoreList)

        const firstRowButton = wrapper.findAll('button').find((button: { text: () => string }) =>
            button.text().includes(amsterdamCentrumFeature.properties.name),
        )
        expect(firstRowButton).toBeDefined()

        await firstRowButton!.trigger('click')

        expect(locator.selectedStoreId).toBe(amsterdamCentrumFeature.properties.storeId)
        expect(locator.mobileView).toBe('list')
        expect(locator.pendingSelectionId).toBeNull()
    })

    it('Should queue a pending selection and flip mobileView to map on mobile, leaving the actual selection for StoreMap to flush', async () => {
        stubMatchMedia(false)
        const locator = seedThreeFeatures()
        const wrapper = await mountWithUApp(StoreList)

        const firstRowButton = wrapper.findAll('button').find((button: { text: () => string }) =>
            button.text().includes(amsterdamCentrumFeature.properties.name),
        )
        expect(firstRowButton).toBeDefined()

        await firstRowButton!.trigger('click')

        expect(locator.mobileView).toBe('map')
        expect(locator.pendingSelectionId).toBe(amsterdamCentrumFeature.properties.storeId)
        expect(locator.selectedStoreId).toBeNull()
    })

    it('Should mark the row matching selectedStoreId as selected', async () => {
        const locator = seedThreeFeatures()
        locator.selectStore(amsterdamSouthFeature.properties.storeId)

        const wrapper = await mountWithUApp(StoreList)

        const selectedButton = wrapper.findAll('button').find((button: { text: () => string }) =>
            button.text().includes(amsterdamSouthFeature.properties.name),
        )
        expect(selectedButton?.attributes('aria-pressed')).toBe('true')
        expect(selectedButton?.classes().some((className: string) => className.includes('border-l-yellow-500'))).toBe(true)
    })

    it('Should render the empty state when filtered features is empty', async () => {
        const locator = seedThreeFeatures()
        locator.setQuery('completely-unmatchable-query-string')

        const wrapper = await mountWithUApp(StoreList)
        await vi.waitFor(() => {
            expect(wrapper.text()).toContain('No stores match your filters')
        })
    })
})
