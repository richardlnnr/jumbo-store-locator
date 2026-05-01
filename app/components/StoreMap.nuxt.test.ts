import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick, shallowRef } from 'vue'

import { useStoreLocator } from '~~/app/stores/useStoreLocator'
import {
    amsterdamCentrumFeature,
    amsterdamSouthFeature,
    eindhovenFeature,
} from '~~/shared/types/store.mock'
import type { JumboStoreFeatureCollection } from '~~/shared/types/geojson'
import StoreMap from './StoreMap.vue'

type MountedWrapper = Awaited<ReturnType<typeof mountSuspended>>

const PIN_IMAGE = { width: 1, height: 1, data: new Uint8Array(4) }

const setData = vi.fn()
const addSource = vi.fn()
const getSource = vi.fn(() => ({ setData }))
const addLayer = vi.fn()
const getLayer = vi.fn(() => undefined)
const addImage = vi.fn()
const hasImage = vi.fn(() => false)
const loadImage = vi.fn(
    (_url: string, callback: (error: Error | null, image: typeof PIN_IMAGE) => void) => {
        callback(null, PIN_IMAGE)
    },
)
const remove = vi.fn()

const fakeMap = {
    addSource,
    getSource,
    addLayer,
    getLayer,
    addImage,
    hasImage,
    loadImage,
    remove,
    on: (event: string, handler: () => void) => {
        if (event === 'load') handler()
    },
}

const mapRef = shallowRef<typeof fakeMap | null>(null)

const createMapMock = vi.hoisted(() => vi.fn())

mockNuxtImport('useMapbox', () => () => ({
    createMap: createMapMock,
    map: mapRef,
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

    setData.mockClear()
    addSource.mockClear()
    getSource.mockClear()
    addLayer.mockClear()
    getLayer.mockClear()
    getLayer.mockImplementation(() => undefined)
    addImage.mockClear()
    hasImage.mockClear()
    hasImage.mockImplementation(() => false)
    loadImage.mockClear()
    loadImage.mockImplementation((_url, callback) => {
        callback(null, PIN_IMAGE)
    })
    remove.mockClear()
    mapRef.value = null
    createMapMock.mockReset()
    createMapMock.mockImplementation(async () => {
        mapRef.value = fakeMap
        return fakeMap
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

    it('Should add a "stores" GeoJSON source bound to filteredFeatureCollection on load', async () => {
        seedThreeFeatures()

        await mountStoreMap()

        expect(addSource).toHaveBeenCalledTimes(1)
        const [sourceId, options] = addSource.mock.calls[0]!
        expect(sourceId).toBe('stores')
        expect(options.type).toBe('geojson')
        expect(options.data.features).toHaveLength(3)
    })

    it('Should call setData on the "stores" source when filters change', async () => {
        const locator = seedThreeFeatures()

        await mountStoreMap()

        locator.setCityFilter(['EINDHOVEN'])
        await nextTick()

        expect(getSource).toHaveBeenCalledWith('stores')
        expect(setData).toHaveBeenCalledTimes(1)
        const nextData = setData.mock.calls[0]![0]
        expect(nextData.features).toHaveLength(1)
        expect(nextData.features[0].properties.storeId).toBe('eindhoven-1')
    })

    it('Should not recreate the source when filters change repeatedly', async () => {
        const locator = seedThreeFeatures()

        await mountStoreMap()

        locator.setCityFilter(['EINDHOVEN'])
        await nextTick()
        locator.setCityFilter(['AMSTERDAM'])
        await nextTick()
        locator.setOpenOnly(true)
        await nextTick()

        expect(addSource).toHaveBeenCalledTimes(1)
        expect(setData.mock.calls.length).toBeGreaterThanOrEqual(2)
    })

    it('Should load the Jumbo pin image and register it under the "jumbo-pin" id after the map loads', async () => {
        seedThreeFeatures()

        await mountStoreMap()

        expect(loadImage).toHaveBeenCalledTimes(1)
        expect(loadImage.mock.calls[0]![0]).toBe('/jumbo-pin.png')
        expect(addImage).toHaveBeenCalledTimes(1)
        const [imageId, image, options] = addImage.mock.calls[0]!
        expect(imageId).toBe('jumbo-pin')
        expect(image).toBe(PIN_IMAGE)
        expect(options).toEqual({ pixelRatio: 2 })
    })

    it('Should add a symbol layer that filters out clusters and uses the Jumbo pin icon with zoom-interpolated size', async () => {
        seedThreeFeatures()

        await mountStoreMap()

        expect(addLayer).toHaveBeenCalledTimes(1)
        const [layer] = addLayer.mock.calls[0]!
        expect(layer).toMatchObject({
            id: 'stores-pins',
            type: 'symbol',
            source: 'stores',
            filter: ['!', ['has', 'point_count']],
            layout: {
                'icon-image': 'jumbo-pin',
                'icon-size': ['interpolate', ['linear'], ['zoom'], 8, 0.3, 14, 0.5],
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
                'icon-anchor': 'bottom',
            },
        })
    })

    it('Should not re-register the image or the symbol layer when filters change', async () => {
        const locator = seedThreeFeatures()

        await mountStoreMap()

        locator.setCityFilter(['EINDHOVEN'])
        await nextTick()
        locator.setOpenOnly(true)
        await nextTick()

        expect(loadImage).toHaveBeenCalledTimes(1)
        expect(addImage).toHaveBeenCalledTimes(1)
        expect(addLayer).toHaveBeenCalledTimes(1)
    })
})
