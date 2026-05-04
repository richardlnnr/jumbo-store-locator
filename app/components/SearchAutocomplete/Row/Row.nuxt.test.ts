import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CitySuggestion } from '~~/shared/types/storeSuggestion'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'
import { amsterdamCentrumFeature } from '~~/shared/types/store.mock'
import SearchAutocompleteRow from './Row.vue'

const amsterdamCity: CitySuggestion = {
    name: 'Amsterdam',
    rawName: 'Amsterdam',
    storesCount: 27,
    state: 'Noord-Holland',
}

describe('SearchAutocompleteRow', () => {
    beforeEach(async () => {
        await setI18nLocale('en')
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(new Date('2026-04-29T10:00:00+02:00'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('Should render the store name as the accessible label without breaking on highlighted segments', async () => {
        const wrapper = await mountWithUApp(SearchAutocompleteRow, {
            variant: 'store',
            feature: amsterdamCentrumFeature,
            query: 'amsterdam',
        })

        const root = wrapper.find('[data-slot="title"]').element.parentElement?.parentElement
        expect(root?.getAttribute('aria-label')).toBe(amsterdamCentrumFeature.properties.name)
    })

    it('Should render bold spans for matched substrings in the title', async () => {
        const wrapper = await mountWithUApp(SearchAutocompleteRow, {
            variant: 'store',
            feature: amsterdamCentrumFeature,
            query: 'amsterdam',
        })

        const boldSpans = wrapper.findAll('[data-slot="title"] span.font-bold')
        expect(boldSpans.length).toBeGreaterThan(0)
        expect(boldSpans.some((span: { text: () => string }) => span.text() === 'Amsterdam')).toBe(true)
    })

    it('Should render the subline as city plus distance when a distance label is provided', async () => {
        const wrapper = await mountWithUApp(SearchAutocompleteRow, {
            variant: 'store',
            feature: amsterdamCentrumFeature,
            query: 'amsterdam',
            distanceLabel: { key: 'distance.km', distance: 1.2 },
        })

        expect(wrapper.find('[data-slot="subline"]').text()).toBe('Amsterdam · 1.2 km')
    })

    it('Should drop the distance suffix when no distance label is provided', async () => {
        const wrapper = await mountWithUApp(SearchAutocompleteRow, {
            variant: 'store',
            feature: amsterdamCentrumFeature,
            query: '',
        })

        expect(wrapper.find('[data-slot="subline"]').text()).toBe('Amsterdam')
    })

    it('Should render a status pill for store variant', async () => {
        const wrapper = await mountWithUApp(SearchAutocompleteRow, {
            variant: 'store',
            feature: amsterdamCentrumFeature,
            query: '',
        })

        expect(wrapper.find('[data-slot="status"]').exists()).toBe(true)
    })

    it('Should render the city stores-count subline for city variant', async () => {
        const wrapper = await mountWithUApp(SearchAutocompleteRow, {
            variant: 'city',
            city: amsterdamCity,
            query: 'amst',
        })

        expect(wrapper.find('[data-slot="subline"]').text()).toBe('27 stores · Noord-Holland')
        expect(wrapper.find('[data-slot="status"]').exists()).toBe(false)
    })

    it('Should apply the active background tone when the active prop is true', async () => {
        const wrapper = await mountWithUApp(SearchAutocompleteRow, {
            variant: 'store',
            feature: amsterdamCentrumFeature,
            query: '',
            active: true,
        })

        expect(wrapper.find('[data-slot="title"]').element.parentElement?.parentElement?.className)
            .toContain('bg-yellow-50')
    })
})
