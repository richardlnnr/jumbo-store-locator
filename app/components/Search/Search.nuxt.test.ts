import { beforeEach, describe, expect, it } from 'vitest'

import { useStoreLocator } from '~~/app/stores/useStoreLocator'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'
import Search from './Search.vue'

describe('Search', () => {
    beforeEach(async () => {
        const locator = useStoreLocator()
        locator.featureCollection = null
        locator.clearFilters()
        locator.clearSelection()

        await setI18nLocale('en')
    })

    it('Should render an input pre-filled with the current store query', async () => {
        const locator = useStoreLocator()
        locator.setQuery('Eindhoven')

        const wrapper = await mountWithUApp(Search)

        const input = wrapper.find('input[type="text"]')
        expect(input.exists()).toBe(true)
        expect((input.element as HTMLInputElement).value).toBe('Eindhoven')
    })

    it('Should write the typed value through to the store query', async () => {
        const locator = useStoreLocator()
        const wrapper = await mountWithUApp(Search)

        const input = wrapper.find('input[type="text"]')
        await input.setValue('Helmond')

        expect(locator.query).toBe('Helmond')
    })
})
