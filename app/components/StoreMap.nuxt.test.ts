import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { shallowRef } from 'vue'
import StoreMap from './StoreMap.vue'

const createMapMock = vi.hoisted(() => vi.fn())

mockNuxtImport('useMapbox', () => () => ({
    createMap: createMapMock,
    map: shallowRef(null),
}))

describe('StoreMap', () => {
    it('Should expose a region landmark with the provided aria-label', async () => {
        const wrapper = await mountSuspended(StoreMap, {
            attrs: { 'aria-label': 'Store map' },
        })

        const section = wrapper.find('section')
        expect(section.exists()).toBe(true)
        expect(section.attributes('role')).toBe('region')
        expect(section.attributes('aria-label')).toBe('Store map')
    })

    it('Should mount the MapBox child filling the pane', async () => {
        const wrapper = await mountSuspended(StoreMap)

        expect(createMapMock).toHaveBeenCalled()
        expect(wrapper.html()).toContain('h-full')
        expect(wrapper.html()).toContain('w-full')
    })
})
