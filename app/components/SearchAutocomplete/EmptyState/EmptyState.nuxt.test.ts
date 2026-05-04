import { describe, expect, it } from 'vitest'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'
import EmptyState from './EmptyState.vue'

describe('SearchAutocompleteEmptyState', () => {
    it('Should render the localized primary nudge in English', async () => {
        await setI18nLocale('en')
        const wrapper = await mountWithUApp(EmptyState)

        expect(wrapper.find('[data-slot="empty-title"]').text()).toBe('Search by name or city')
    })

    it('Should render the localized primary nudge in Dutch', async () => {
        await setI18nLocale('nl')
        const wrapper = await mountWithUApp(EmptyState)

        expect(wrapper.find('[data-slot="empty-title"]').text()).toBe('Zoek op naam of stad')
    })

    it('Should interpolate the example city into the secondary hint', async () => {
        await setI18nLocale('en')
        const wrapper = await mountWithUApp(EmptyState)

        expect(wrapper.find('[data-slot="empty-hint"]').text()).toBe(
            'Try a city like \'Veghel\' or a store name',
        )
    })
})
