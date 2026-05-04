import { beforeEach, describe, expect, it } from 'vitest'
import { useStoreLocator } from '~~/app/stores/useStoreLocator'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'

import MobileSwitchView from './MobileSwitchView.vue'

const pillSelector = '[data-component="mobile-switch-view"]'

describe('MobileSwitchView', () => {
    beforeEach(() => {
        const locator = useStoreLocator()
        locator.setMobileView('list')
    })

    it('Should render the Show map label and the map icon when mobileView is list', async () => {
        const wrapper = await mountWithUApp(MobileSwitchView)

        const pill = wrapper.find(pillSelector)
        expect(pill.exists()).toBe(true)
        expect(pill.text()).toBe('Show map')
        expect(pill.html()).toContain('i-lucide:map')
    })

    it('Should render the Show list label and the list icon when mobileView is map', async () => {
        const locator = useStoreLocator()
        locator.setMobileView('map')

        const wrapper = await mountWithUApp(MobileSwitchView)

        const pill = wrapper.find(pillSelector)
        expect(pill.text()).toBe('Show list')
        expect(pill.html()).toContain('i-lucide:list')
    })

    it('Should flip mobileView to the opposite value when clicked', async () => {
        const wrapper = await mountWithUApp(MobileSwitchView)
        const locator = useStoreLocator()

        await wrapper.find(pillSelector).trigger('click')

        expect(locator.mobileView).toBe('map')

        await wrapper.find(pillSelector).trigger('click')

        expect(locator.mobileView).toBe('list')
    })

    it('Should be hidden from md upward via the md:hidden utility', async () => {
        const wrapper = await mountWithUApp(MobileSwitchView)

        const pill = wrapper.find(pillSelector)
        expect(pill.classes()).toContain('md:hidden')
    })

    it('Should preserve a focus-visible outline ring on the pill', async () => {
        const wrapper = await mountWithUApp(MobileSwitchView)

        const pill = wrapper.find(pillSelector)
        expect(pill.classes()).toContain('focus-visible:outline-2')
        expect(pill.classes()).toContain('focus-visible:outline-yellow-500')
    })

    it('Should expose a polite live region announcing the current view', async () => {
        const wrapper = await mountWithUApp(MobileSwitchView)

        const liveRegion = wrapper.find('[data-slot="view-toggle-live-region"]')
        expect(liveRegion.exists()).toBe(true)
        expect(liveRegion.attributes('aria-live')).toBe('polite')
        expect(liveRegion.attributes('role')).toBe('status')
        expect(liveRegion.text()).toBe('Now showing list')
    })

    it('Should update the live region announcement when mobileView flips to map', async () => {
        const wrapper = await mountWithUApp(MobileSwitchView)
        const locator = useStoreLocator()

        locator.setMobileView('map')
        await wrapper.vm.$nextTick()

        const liveRegion = wrapper.find('[data-slot="view-toggle-live-region"]')
        expect(liveRegion.text()).toBe('Now showing map')
    })
})
