import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { shallowRef } from 'vue'
import MapBox from './MapBox.vue'

const createMapMock = vi.hoisted(() => vi.fn())

mockNuxtImport('useMapbox', () => () => ({
    createMap: createMapMock,
    map: shallowRef(null),
}))

describe('MapBox', () => {
    it('Should mount a full-width map container and call createMap with the streets style', async () => {
        const wrapper = await mountSuspended(MapBox)

        expect(createMapMock).toHaveBeenCalledTimes(1)
        const options = createMapMock.mock.calls[0]![0]
        expect(options.container).toBeInstanceOf(HTMLElement)
        expect(options.style).toBe('mapbox://styles/mapbox/streets-v12')
        expect(options.center).toEqual([5.387957, 52.155576])
        expect(options.zoom).toBe(8)
        expect(wrapper.html()).toContain('h-[400px]')
        expect(wrapper.html()).toContain('w-full')
    })
})
