import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { setI18nLocale } from '~~/test-utils/i18n'
import LanguageToggle from './LanguageToggle.vue'

describe('LanguageToggle', () => {
    beforeEach(async () => {
        await setI18nLocale('en')
    })

    it('Should render a button per configured locale labelled with its uppercase code', async () => {
        const wrapper = await mountSuspended(LanguageToggle)

        const buttons = wrapper.findAll('button')
        const labels = buttons.map(b => b.text())

        expect(labels).toContain('EN')
        expect(labels).toContain('NL')
    })

    it('Should mark the default locale as active and other locales as inactive via aria-pressed', async () => {
        const wrapper = await mountSuspended(LanguageToggle)

        const active = wrapper.get('button[aria-pressed="true"]')
        const inactive = wrapper.get('button[aria-pressed="false"]')

        expect(active.text()).toBe('EN')
        expect(inactive.text()).toBe('NL')
    })

    it('Should switch the active locale when an inactive button is clicked', async () => {
        const wrapper = await mountSuspended(LanguageToggle)

        await wrapper.get('button[aria-pressed="false"]').trigger('click')
        await flushPromises()
        await new Promise(resolve => setTimeout(resolve, 50))
        await flushPromises()

        expect(wrapper.get('button[aria-pressed="true"]').text()).toBe('NL')
        expect(wrapper.get('button[aria-pressed="false"]').text()).toBe('EN')
    })

    it('Should expose an accessible name on the group via aria-label', async () => {
        const wrapper = await mountSuspended(LanguageToggle)

        const group = wrapper.get('[role="group"]')
        expect(group.attributes('aria-label')).toBe('Language')
    })
})
