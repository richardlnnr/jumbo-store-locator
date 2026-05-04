import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick, shallowRef } from 'vue'

import { useStoreLocator } from '~~/app/stores/useStoreLocator'
import StoresIndex from './index.vue'

mockNuxtImport('useMapbox', () => () => ({
    createMap: vi.fn(),
    map: shallowRef(null),
}))

const switchSelector = '[data-component="mobile-switch-view"]'

describe('stores/index page', () => {
    beforeEach(() => {
        const locator = useStoreLocator()
        locator.flushPendingSelection()
        locator.clearSelection()
        locator.featureCollection = null
        locator.clearFilters()
        locator.setMobileView('list')
    })

    it('Should render the store list region with the i18n list label', async () => {
        const wrapper = await mountSuspended(StoresIndex)

        const list = wrapper.find('aside')
        expect(list.exists()).toBe(true)
        expect(list.attributes('aria-label')).toBe('Store list')
    })

    it('Should render the store map region with the i18n map label', async () => {
        const wrapper = await mountSuspended(StoresIndex)

        const map = wrapper.find('section')
        expect(map.exists()).toBe(true)
        expect(map.attributes('aria-label')).toBe('Store map')
    })

    it('Should hide the map region on mobile and reveal it from md upward', async () => {
        const wrapper = await mountSuspended(StoresIndex)

        const map = wrapper.find('section')
        expect(map.classes()).toContain('hidden')
        expect(map.classes()).toContain('md:block')
    })

    it('Should pin the list pane to 420px from md upward', async () => {
        const wrapper = await mountSuspended(StoresIndex)

        const list = wrapper.find('aside')
        expect(list.classes()).toContain('md:w-105')
        expect(list.classes()).toContain('md:flex-none')
    })

    it('Should toggle list and map visibility in step with mobileView when MobileSwitchView is activated', async () => {
        const wrapper = await mountSuspended(StoresIndex)

        const initialList = wrapper.find('aside')
        const initialMap = wrapper.find('section')
        expect(initialList.classes()).toContain('flex-1')
        expect(initialMap.classes()).toContain('hidden')

        await wrapper.find(switchSelector).trigger('click')

        const flippedList = wrapper.find('aside')
        const flippedMap = wrapper.find('section')
        expect(flippedList.classes()).toContain('hidden')
        expect(flippedMap.classes()).toContain('flex-1')
    })

    it('Should keep both list and map visible at md+ regardless of mobileView', async () => {
        const wrapper = await mountSuspended(StoresIndex)
        const locator = useStoreLocator()

        locator.setMobileView('map')
        await nextTick()

        const aside = wrapper.find('aside')
        const section = wrapper.find('section')
        expect(aside.classes()).toContain('md:flex')
        expect(section.classes()).toContain('md:block')
    })
})
