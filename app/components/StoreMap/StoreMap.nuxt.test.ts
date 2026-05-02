import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick, ref, shallowRef } from 'vue'

import { useStoreLocator } from '~~/app/stores/useStoreLocator'
import {
    amsterdamCentrumFeature,
    amsterdamSouthFeature,
    eindhovenFeature,
} from '~~/shared/types/store.mock'
import type { JumboStoreFeatureCollection } from '~~/shared/types/geojson'
import { createFakeMap } from '~~/test-utils/createFakeMap'
import StoreMap from './StoreMap.vue'

type MountedWrapper = Awaited<ReturnType<typeof mountSuspended>>

const harness = createFakeMap()
const mapRef = shallowRef<typeof harness.fakeMap | null>(null)
const isMapLoadedRef = ref(false)

const createMapMock = vi.hoisted(() => vi.fn())

mockNuxtImport('useMapbox', () => () => ({
    createMap: createMapMock,
    map: mapRef,
    isMapLoaded: isMapLoadedRef,
}))

const sampleFeatureCollection: JumboStoreFeatureCollection = {
    type: 'FeatureCollection',
    features: [eindhovenFeature, amsterdamCentrumFeature, amsterdamSouthFeature],
}

const seedThreeFeatures = () => {
    const locator = useStoreLocator()
    locator.featureCollection = sampleFeatureCollection
    return locator
}

let wrapper: MountedWrapper | null = null
const mountStoreMap = async (
    options?: Parameters<typeof mountSuspended>[1],
): Promise<MountedWrapper> => {
    wrapper = await mountSuspended(StoreMap, options)
    return wrapper
}

beforeEach(() => {
    const locator = useStoreLocator()
    locator.featureCollection = null
    locator.clearFilters()
    locator.clearSelection()

    Object.values(harness.spies).forEach((spy) => {
        spy.mockClear()
    })
    harness.spies.getLayer.mockImplementation((id: string) =>
        id === 'building-entrance' ? ({ id } as never) : undefined,
    )
    harness.spies.hasImage.mockImplementation(() => false)
    harness.spies.loadImage.mockImplementation((_url, callback) => {
        callback(null, { width: 1, height: 1, data: new Uint8Array(4) })
    })
    harness.spies.getClusterExpansionZoom.mockImplementation((_id, callback) => {
        callback(null, 11)
    })
    harness.canvasStyle.cursor = ''
    harness.layerHandlers.clear()
    harness.loadHandlers.length = 0
    mapRef.value = null
    isMapLoadedRef.value = false
    createMapMock.mockReset()
    createMapMock.mockImplementation(async () => {
        mapRef.value = harness.fakeMap
        return harness.fakeMap
    })
})

afterEach(() => {
    wrapper?.unmount()
    wrapper = null
})

describe('StoreMap', () => {
    it('Should expose a region landmark with the provided aria-label', async () => {
        const mounted = await mountStoreMap({ attrs: { 'aria-label': 'Store map' } })

        const section = mounted.find('section')
        expect(section.exists()).toBe(true)
        expect(section.attributes('role')).toBe('region')
        expect(section.attributes('aria-label')).toBe('Store map')
    })

    it('Should call createMap with bounds derived from the current filtered feature collection', async () => {
        seedThreeFeatures()

        await mountStoreMap()

        expect(createMapMock).toHaveBeenCalledTimes(1)
        const options = createMapMock.mock.calls[0]![0]
        expect(options.bounds).toBeDefined()
        expect(options.center).toBeUndefined()
        expect(options.zoom).toBeUndefined()
        expect(options.style).toBe('mapbox://styles/mapbox/streets-v12')
    })

    it('Should render the loading overlay while isMapLoaded is false', async () => {
        isMapLoadedRef.value = false

        const mounted = await mountStoreMap()

        expect(mounted.find('[role="status"][aria-busy="true"]').exists()).toBe(true)
    })

    it('Should hide the loading overlay once isMapLoaded flips to true', async () => {
        const mounted = await mountStoreMap()
        expect(mounted.find('[role="status"][aria-busy="true"]').exists()).toBe(true)

        isMapLoadedRef.value = true
        await nextTick()
        await nextTick()

        expect(mounted.find('[role="status"][aria-busy="true"]').exists()).toBe(false)
    })
})
