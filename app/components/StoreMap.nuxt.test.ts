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

type LayerHandler = (event: { features?: Array<Record<string, unknown>> }) => void

const setData = vi.fn()
const addSource = vi.fn()
const getStyle = vi.fn(() => ({
    layers: [
        { id: 'background', type: 'background' },
        { id: 'water', type: 'fill' },
        { id: 'road-label', type: 'symbol' },
        { id: 'settlement-major-label', type: 'symbol' },
    ],
}))
const getClusterExpansionZoom = vi.fn(
    (_clusterId: number, callback: (error: Error | null, zoom: number) => void) => {
        callback(null, 11)
    },
)
const getSource = vi.fn(() => ({ setData, getClusterExpansionZoom }))
const addLayer = vi.fn()
const getLayer = vi.fn<(id: string) => unknown>(() => undefined)
const addImage = vi.fn()
const hasImage = vi.fn(() => false)
const loadImage = vi.fn(
    (_url: string, callback: (error: Error | null, image: typeof PIN_IMAGE) => void) => {
        callback(null, PIN_IMAGE)
    },
)
const remove = vi.fn()
const easeTo = vi.fn()
const canvasStyle: { cursor: string } = { cursor: '' }
const layerHandlers = new Map<string, LayerHandler>()

const fakeMap = {
    addSource,
    getSource,
    getStyle,
    addLayer,
    getLayer,
    addImage,
    hasImage,
    loadImage,
    remove,
    easeTo,
    getCanvas: () => ({ style: canvasStyle }),
    on: (
        event: string,
        layerOrHandler: string | (() => void),
        maybeHandler?: LayerHandler,
    ) => {
        if (typeof layerOrHandler === 'function') {
            if (event === 'load') layerOrHandler()
            return
        }
        if (maybeHandler) {
            layerHandlers.set(`${event}:${layerOrHandler}`, maybeHandler)
        }
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
    getStyle.mockClear()
    addLayer.mockClear()
    getLayer.mockClear()
    getLayer.mockImplementation((id: string) =>
        id === 'building-entrance' ? ({ id } as never) : undefined,
    )
    addImage.mockClear()
    hasImage.mockClear()
    hasImage.mockImplementation(() => false)
    loadImage.mockClear()
    loadImage.mockImplementation((_url, callback) => {
        callback(null, PIN_IMAGE)
    })
    remove.mockClear()
    easeTo.mockClear()
    getClusterExpansionZoom.mockClear()
    getClusterExpansionZoom.mockImplementation((_id, callback) => {
        callback(null, 11)
    })
    canvasStyle.cursor = ''
    layerHandlers.clear()
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

    it('Should enable clustering on the "stores" source with sensible clusterRadius and clusterMaxZoom', async () => {
        seedThreeFeatures()

        await mountStoreMap()

        const [, options] = addSource.mock.calls[0]!
        expect(options.cluster).toBe(true)
        expect(options.clusterRadius).toBe(30)
        expect(options.clusterMaxZoom).toBe(10)
    })

    it('Should add a clusters-halo circle layer with point_count filter and 3-stop step radius', async () => {
        seedThreeFeatures()

        await mountStoreMap()

        const haloCall = addLayer.mock.calls.find(([layer]) => layer.id === 'clusters-halo')
        expect(haloCall).toBeDefined()
        const [layer] = haloCall!
        expect(layer).toMatchObject({
            id: 'clusters-halo',
            type: 'circle',
            source: 'stores',
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': 'rgba(238, 183, 23, 0.25)',
                'circle-radius': ['step', ['get', 'point_count'], 15, 10, 19, 50, 22],
            },
        })
    })

    it('Should add a clusters circle layer with brand yellow fill, white stroke, and 3-stop step radius', async () => {
        seedThreeFeatures()

        await mountStoreMap()

        const clusterCall = addLayer.mock.calls.find(([layer]) => layer.id === 'clusters')
        expect(clusterCall).toBeDefined()
        const [layer] = clusterCall!
        expect(layer).toMatchObject({
            id: 'clusters',
            type: 'circle',
            source: 'stores',
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': '#eeb717',
                'circle-radius': ['step', ['get', 'point_count'], 11, 10, 14, 50, 17],
                'circle-stroke-color': '#ffffff',
                'circle-stroke-width': 2,
            },
        })
    })

    it('Should insert clusters-halo, clusters, and cluster-count before the building-entrance label layer so place labels render on top', async () => {
        seedThreeFeatures()

        await mountStoreMap()

        const haloCall = addLayer.mock.calls.find(([layer]) => layer.id === 'clusters-halo')!
        const clusterCall = addLayer.mock.calls.find(([layer]) => layer.id === 'clusters')!
        const countCall = addLayer.mock.calls.find(([layer]) => layer.id === 'cluster-count')!
        expect(haloCall[1]).toBe('building-entrance')
        expect(clusterCall[1]).toBe('building-entrance')
        expect(countCall[1]).toBe('building-entrance')
    })

    it('Should add a cluster-count symbol layer reading point_count_abbreviated with 3-stop step text size', async () => {
        seedThreeFeatures()

        await mountStoreMap()

        const countCall = addLayer.mock.calls.find(([layer]) => layer.id === 'cluster-count')
        expect(countCall).toBeDefined()
        const [layer] = countCall!
        expect(layer).toMatchObject({
            id: 'cluster-count',
            type: 'symbol',
            source: 'stores',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': ['get', 'point_count_abbreviated'],
                'text-size': ['step', ['get', 'point_count'], 11, 10, 13, 50, 16],
                'text-allow-overlap': true,
                'text-ignore-placement': true,
            },
            paint: {
                'text-color': '#171717',
            },
        })
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

        expect(addLayer).toHaveBeenCalledTimes(4)
        const pinCall = addLayer.mock.calls.find(([layer]) => layer.id === 'stores-pins')
        expect(pinCall).toBeDefined()
        const [layer] = pinCall!
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

    it('Should not re-register the image or any layer when filters change', async () => {
        const locator = seedThreeFeatures()

        await mountStoreMap()

        locator.setCityFilter(['EINDHOVEN'])
        await nextTick()
        locator.setOpenOnly(true)
        await nextTick()

        expect(loadImage).toHaveBeenCalledTimes(1)
        expect(addImage).toHaveBeenCalledTimes(1)
        expect(addLayer).toHaveBeenCalledTimes(4)
    })

    it('Should skip loading and registering the image when the Jumbo pin is already on the map', async () => {
        seedThreeFeatures()
        hasImage.mockImplementation(() => true)

        await mountStoreMap()
        await nextTick()

        expect(loadImage).not.toHaveBeenCalled()
        expect(addImage).not.toHaveBeenCalled()
        expect(addLayer).toHaveBeenCalledTimes(4)
    })

    it('Should still register the cluster layers but skip the pin symbol layer when the Jumbo pin image fails to load', async () => {
        seedThreeFeatures()
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const failure = new Error('Network failure')
        loadImage.mockImplementation((_url, callback) => {
            callback(failure, null as never)
        })

        await mountStoreMap()
        await nextTick()

        expect(loadImage).toHaveBeenCalledTimes(1)
        expect(addImage).not.toHaveBeenCalled()
        expect(addLayer).toHaveBeenCalledTimes(3)
        const layerIds = addLayer.mock.calls.map(([layer]) => layer.id)
        expect(layerIds).toEqual(['clusters-halo', 'clusters', 'cluster-count'])
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[StoreMap] failed to load Jumbo pin image',
            failure,
        )

        consoleErrorSpy.mockRestore()
    })

    it('Should register click, mouseenter, and mouseleave handlers on the clusters-halo layer', async () => {
        seedThreeFeatures()

        await mountStoreMap()

        expect(layerHandlers.has('click:clusters-halo')).toBe(true)
        expect(layerHandlers.has('mouseenter:clusters-halo')).toBe(true)
        expect(layerHandlers.has('mouseleave:clusters-halo')).toBe(true)
    })

    it('Should call easeTo with the cluster center and the zoom returned by getClusterExpansionZoom when a cluster is clicked', async () => {
        seedThreeFeatures()

        await mountStoreMap()

        const click = layerHandlers.get('click:clusters-halo')
        click!({
            features: [{
                properties: { cluster_id: 42 },
                geometry: { type: 'Point', coordinates: [4.9, 52.37] },
            }],
        })

        expect(getClusterExpansionZoom).toHaveBeenCalledTimes(1)
        expect(getClusterExpansionZoom.mock.calls[0]![0]).toBe(42)
        expect(easeTo).toHaveBeenCalledTimes(1)
        expect(easeTo).toHaveBeenCalledWith({ center: [4.9, 52.37], zoom: 11 })
    })

    it('Should not call easeTo when the clicked feature has no cluster_id', async () => {
        seedThreeFeatures()

        await mountStoreMap()

        const click = layerHandlers.get('click:clusters-halo')
        click!({
            features: [{
                properties: {},
                geometry: { type: 'Point', coordinates: [4.9, 52.37] },
            }],
        })

        expect(getClusterExpansionZoom).not.toHaveBeenCalled()
        expect(easeTo).not.toHaveBeenCalled()
    })

    it('Should not call easeTo when getClusterExpansionZoom yields an error', async () => {
        seedThreeFeatures()
        getClusterExpansionZoom.mockImplementationOnce((_id, callback) => {
            callback(new Error('boom'), 0)
        })

        await mountStoreMap()

        const click = layerHandlers.get('click:clusters-halo')
        click!({
            features: [{
                properties: { cluster_id: 42 },
                geometry: { type: 'Point', coordinates: [4.9, 52.37] },
            }],
        })

        expect(getClusterExpansionZoom).toHaveBeenCalledTimes(1)
        expect(easeTo).not.toHaveBeenCalled()
    })

    it('Should set the canvas cursor to pointer on mouseenter and reset it on mouseleave over clusters-halo', async () => {
        seedThreeFeatures()

        await mountStoreMap()

        layerHandlers.get('mouseenter:clusters-halo')!({})
        expect(canvasStyle.cursor).toBe('pointer')

        layerHandlers.get('mouseleave:clusters-halo')!({})
        expect(canvasStyle.cursor).toBe('')
    })
})
