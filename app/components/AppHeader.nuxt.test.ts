import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppHeader from './AppHeader.vue'

describe('AppHeader', () => {
    it('Should render a header landmark with the brand name and tagline from i18n', async () => {
        const wrapper = await mountSuspended(AppHeader)

        const header = wrapper.find('header')
        expect(header.exists()).toBe(true)
        expect(header.text()).toContain('Jumbo')
        expect(header.text()).toContain('Store locator')
    })
})
