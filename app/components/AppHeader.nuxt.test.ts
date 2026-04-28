import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppHeader from './AppHeader.vue'
import LanguageToggle from './LanguageToggle.vue'

describe('AppHeader', () => {
    it('Should render a header landmark with the wordmark and tagline', async () => {
        const wrapper = await mountSuspended(AppHeader)

        const header = wrapper.find('header')
        expect(header.exists()).toBe(true)
        expect(header.text()).toContain('Store locator')
    })

    it('Should render the Jumbo wordmark image with descriptive alt text', async () => {
        const wrapper = await mountSuspended(AppHeader)

        const img = wrapper.get('img')
        expect(img.attributes('alt')).toBe('Jumbo')
        expect(img.attributes('src')).toContain('jumbo-logo')
    })

    it('Should mount the language toggle', async () => {
        const wrapper = await mountSuspended(AppHeader)

        expect(wrapper.findComponent(LanguageToggle).exists()).toBe(true)
    })
})
