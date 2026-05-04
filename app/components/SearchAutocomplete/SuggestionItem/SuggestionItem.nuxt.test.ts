import { describe, expect, it } from 'vitest'

import type { SuggestionItem } from '~~/shared/types/storeSuggestion'
import { amsterdamCentrumFeature } from '~~/shared/types/store.mock'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'
import SuggestionItemComponent from './SuggestionItem.vue'

describe('SearchAutocompleteSuggestionItem', () => {
    it('Should render an h3 section header for label items', async () => {
        await setI18nLocale('en')
        const item: SuggestionItem = { kind: 'label', label: 'Stores', disabled: true }
        const wrapper = await mountWithUApp(SuggestionItemComponent, { item, query: '' })

        const header = wrapper.find('[data-slot="suggestion-section-label"]')
        expect(header.exists()).toBe(true)
        expect(header.element.tagName).toBe('H3')
        expect(header.text()).toBe('Stores')
    })

    it('Should render the store row variant for store items', async () => {
        await setI18nLocale('en')
        const item: SuggestionItem = {
            kind: 'store',
            label: amsterdamCentrumFeature.properties.name,
            feature: amsterdamCentrumFeature,
        }
        const wrapper = await mountWithUApp(SuggestionItemComponent, { item, query: 'amsterdam' })

        expect(wrapper.html()).toContain(amsterdamCentrumFeature.properties.name)
        expect(wrapper.html()).toContain('Amsterdam')
    })

    it('Should render the city row variant for city items', async () => {
        await setI18nLocale('en')
        const item: SuggestionItem = {
            kind: 'city',
            label: 'Amsterdam',
            city: { name: 'Amsterdam', rawName: 'Amsterdam', state: 'Noord-Holland', storesCount: 25 },
        }
        const wrapper = await mountWithUApp(SuggestionItemComponent, { item, query: 'amst' })

        expect(wrapper.html()).toContain('Amsterdam')
        expect(wrapper.html()).toContain('Noord-Holland')
    })

    it('Should render the cap notice for cap items with the localized message', async () => {
        await setI18nLocale('en')
        const item: SuggestionItem = {
            kind: 'cap',
            label: 'Showing the first 5 results.',
            count: 5,
            disabled: true,
        }
        const wrapper = await mountWithUApp(SuggestionItemComponent, { item, query: 'amst' })

        expect(wrapper.html()).toContain('Showing the first 5 results')
    })
})
