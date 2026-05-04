import { beforeEach, describe, expect, it } from 'vitest'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'
import SearchAutocompleteHintRow from './HintRow.vue'

describe('SearchAutocompleteHintRow', () => {
    beforeEach(async () => {
        await setI18nLocale('en')
    })

    it('Should render Navigate, Select, and Close hint labels', async () => {
        const wrapper = await mountWithUApp(SearchAutocompleteHintRow)

        const text = wrapper.text()
        expect(text).toContain('Navigate')
        expect(text).toContain('Select')
        expect(text).toContain('Close')
    })

    it('Should mark the row as aria-hidden so the listbox semantics stay clean', async () => {
        const wrapper = await mountWithUApp(SearchAutocompleteHintRow)

        const root = wrapper.find('[data-slot="hint-row"]')
        expect(root.attributes('aria-hidden')).toBe('true')
    })

    it('Should localize hint copy when the locale switches', async () => {
        await setI18nLocale('nl')
        const wrapper = await mountWithUApp(SearchAutocompleteHintRow)

        const text = wrapper.text()
        expect(text).toContain('Navigeren')
        expect(text).toContain('Kiezen')
        expect(text).toContain('Sluiten')
    })
})
