import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { shallowRef } from 'vue'
import StoresIndex from './index.vue'

mockNuxtImport('useMapbox', () => () => ({
    createMap: vi.fn(),
    map: shallowRef(null),
}))

describe('stores/index page', () => {
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
        expect(list.classes()).toContain('md:w-[420px]')
        expect(list.classes()).toContain('md:flex-none')
    })
})
