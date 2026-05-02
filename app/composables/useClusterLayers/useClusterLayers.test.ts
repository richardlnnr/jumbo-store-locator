import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { effectScope, nextTick, shallowRef } from 'vue'

import { createFakeMap } from '../../../test-utils/createFakeMap'
import { useClusterLayers } from './useClusterLayers'

type FakeMap = ReturnType<typeof createFakeMap>['fakeMap']

const mountClusterLayers = async () => {
    const harness = createFakeMap()
    const mapRef = shallowRef<FakeMap | null>(null)

    const scope = effectScope()
    scope.run(() => {
        useClusterLayers(mapRef as never)
    })

    mapRef.value = harness.fakeMap
    await nextTick()

    return { ...harness, scope }
}

describe('useClusterLayers', () => {
    let activeScope: ReturnType<typeof effectScope> | null = null

    beforeEach(() => {
        activeScope = null
    })

    afterEach(() => {
        activeScope?.stop()
    })

    it('Should add a clusters-halo circle layer with point_count filter and 3-stop step radius', async () => {
        const { spies, scope } = await mountClusterLayers()
        activeScope = scope

        const haloCall = spies.addLayer.mock.calls.find(([layer]) => layer.id === 'clusters-halo')
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
        const { spies, scope } = await mountClusterLayers()
        activeScope = scope

        const clusterCall = spies.addLayer.mock.calls.find(([layer]) => layer.id === 'clusters')
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

    it('Should add a cluster-count symbol layer reading point_count_abbreviated with 3-stop step text size', async () => {
        const { spies, scope } = await mountClusterLayers()
        activeScope = scope

        const countCall = spies.addLayer.mock.calls.find(([layer]) => layer.id === 'cluster-count')
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

    it('Should insert clusters-halo, clusters, and cluster-count before the building-entrance label layer', async () => {
        const { spies, scope } = await mountClusterLayers()
        activeScope = scope

        const haloCall = spies.addLayer.mock.calls.find(([layer]) => layer.id === 'clusters-halo')!
        const clusterCall = spies.addLayer.mock.calls.find(([layer]) => layer.id === 'clusters')!
        const countCall = spies.addLayer.mock.calls.find(([layer]) => layer.id === 'cluster-count')!
        expect(haloCall[1]).toBe('building-entrance')
        expect(clusterCall[1]).toBe('building-entrance')
        expect(countCall[1]).toBe('building-entrance')
    })

    it('Should register click, mouseenter, and mouseleave handlers on the clusters-halo layer', async () => {
        const { layerHandlers, scope } = await mountClusterLayers()
        activeScope = scope

        expect(layerHandlers.has('click:clusters-halo')).toBe(true)
        expect(layerHandlers.has('mouseenter:clusters-halo')).toBe(true)
        expect(layerHandlers.has('mouseleave:clusters-halo')).toBe(true)
    })

    it('Should call easeTo with the cluster center and the zoom returned by getClusterExpansionZoom when a cluster is clicked', async () => {
        const { layerHandlers, spies, scope } = await mountClusterLayers()
        activeScope = scope

        const click = layerHandlers.get('click:clusters-halo')
        click!({
            features: [{
                properties: { cluster_id: 42 },
                geometry: { type: 'Point', coordinates: [4.9, 52.37] },
            }],
        })

        expect(spies.getClusterExpansionZoom).toHaveBeenCalledTimes(1)
        expect(spies.getClusterExpansionZoom.mock.calls[0]![0]).toBe(42)
        expect(spies.easeTo).toHaveBeenCalledTimes(1)
        expect(spies.easeTo).toHaveBeenCalledWith({ center: [4.9, 52.37], zoom: 11 })
    })

    it('Should not call easeTo when the clicked feature has no cluster_id', async () => {
        const { layerHandlers, spies, scope } = await mountClusterLayers()
        activeScope = scope

        const click = layerHandlers.get('click:clusters-halo')
        click!({
            features: [{
                properties: {},
                geometry: { type: 'Point', coordinates: [4.9, 52.37] },
            }],
        })

        expect(spies.getClusterExpansionZoom).not.toHaveBeenCalled()
        expect(spies.easeTo).not.toHaveBeenCalled()
    })

    it('Should not call easeTo when getClusterExpansionZoom yields an error', async () => {
        const { layerHandlers, spies, scope } = await mountClusterLayers()
        activeScope = scope

        spies.getClusterExpansionZoom.mockImplementationOnce((_id, callback) => {
            callback(new Error('boom'), 0)
        })

        const click = layerHandlers.get('click:clusters-halo')
        click!({
            features: [{
                properties: { cluster_id: 42 },
                geometry: { type: 'Point', coordinates: [4.9, 52.37] },
            }],
        })

        expect(spies.getClusterExpansionZoom).toHaveBeenCalledTimes(1)
        expect(spies.easeTo).not.toHaveBeenCalled()
    })

    it('Should set the canvas cursor to pointer on mouseenter and reset it on mouseleave over clusters-halo', async () => {
        const { layerHandlers, canvasStyle, scope } = await mountClusterLayers()
        activeScope = scope

        layerHandlers.get('mouseenter:clusters-halo')!({})
        expect(canvasStyle.cursor).toBe('pointer')

        layerHandlers.get('mouseleave:clusters-halo')!({})
        expect(canvasStyle.cursor).toBe('')
    })
})
