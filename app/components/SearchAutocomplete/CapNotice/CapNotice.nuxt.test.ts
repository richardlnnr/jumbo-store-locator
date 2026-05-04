import { beforeEach, describe, expect, it } from 'vitest'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'
import SearchAutocompleteCapNotice from './CapNotice.vue'

describe('SearchAutocompleteCapNotice', () => {
    beforeEach(async () => {
        await setI18nLocale('en')
    })

    it('Should render the cap-notice copy with the provided count', async () => {
        const wrapper = await mountWithUApp(SearchAutocompleteCapNotice, { count: 10 })

        expect(wrapper.text()).toBe('Showing the first 10 results. Refine your search to narrow them.')
    })

    it('Should reflect a smaller cap value in the rendered copy', async () => {
        const wrapper = await mountWithUApp(SearchAutocompleteCapNotice, { count: 5 })

        expect(wrapper.text()).toBe('Showing the first 5 results. Refine your search to narrow them.')
    })

    it('Should mark the leading info icon as decorative via aria-hidden', async () => {
        const wrapper = await mountWithUApp(SearchAutocompleteCapNotice, { count: 10 })

        const icon = wrapper.find('span.iconify, svg, [aria-hidden]')
        expect(wrapper.html()).toContain('aria-hidden="true"')
        expect(icon.exists()).toBe(true)
    })

    it('Should render the localized Dutch copy when the locale switches', async () => {
        await setI18nLocale('nl')
        const wrapper = await mountWithUApp(SearchAutocompleteCapNotice, { count: 5 })

        expect(wrapper.text()).toBe('De eerste 5 resultaten worden getoond. Verfijn je zoekopdracht om deze te beperken.')
    })
})
