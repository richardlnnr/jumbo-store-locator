import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { effectScope, nextTick, shallowRef } from 'vue'

import type { JumboStoreFeatureCollection } from '../../shared/types/geojson'
import {
    amsterdamCentrumFeature,
    amsterdamSouthFeature,
    eindhovenFeature,
} from '../../shared/types/store.mock'
import { createFakeMap } from '../../test-utils/createFakeMap'
import { STORES_SOURCE_ID, useStoreSource } from './useStoreSource'

const sampleFeatureCollection: JumboStoreFeatureCollection = {
    type: 'FeatureCollection',
    features: [eindhovenFeature, amsterdamCentrumFeature, amsterdamSouthFeature],
}

const emptyFeatureCollection: JumboStoreFeatureCollection = {
    type: 'FeatureCollection',
    features: [],
}

describe('useStoreSource', () => {
    let scope: ReturnType<typeof effectScope>

    beforeEach(() => {
        scope = effectScope()
    })

    afterEach(() => {
        scope.stop()
    })

    it('Should add a "stores" GeoJSON source bound to the feature collection on map load', async () => {
        const { fakeMap, spies } = createFakeMap()
        const mapRef = shallowRef<typeof fakeMap | null>(null)
        const fcRef = shallowRef(sampleFeatureCollection)

        scope.run(() => {
            useStoreSource(mapRef as never, fcRef)
        })

        mapRef.value = fakeMap
        await nextTick()

        expect(spies.addSource).toHaveBeenCalledTimes(1)
        const [sourceId, options] = spies.addSource.mock.calls[0]!
        expect(sourceId).toBe(STORES_SOURCE_ID)
        expect(options).toMatchObject({
            type: 'geojson',
            data: sampleFeatureCollection,
        })
    })

    it('Should enable clustering on the source with sensible clusterRadius and clusterMaxZoom', async () => {
        const { fakeMap, spies } = createFakeMap()
        const mapRef = shallowRef<typeof fakeMap | null>(null)
        const fcRef = shallowRef(sampleFeatureCollection)

        scope.run(() => {
            useStoreSource(mapRef as never, fcRef)
        })

        mapRef.value = fakeMap
        await nextTick()

        const [, options] = spies.addSource.mock.calls[0]!
        expect(options.cluster).toBe(true)
        expect(options.clusterRadius).toBe(30)
        expect(options.clusterMaxZoom).toBe(10)
    })

    it('Should call setData on the source when the feature collection changes', async () => {
        const { fakeMap, spies } = createFakeMap()
        const mapRef = shallowRef<typeof fakeMap | null>(null)
        const fcRef = shallowRef(emptyFeatureCollection)

        scope.run(() => {
            useStoreSource(mapRef as never, fcRef)
        })

        mapRef.value = fakeMap
        await nextTick()

        fcRef.value = sampleFeatureCollection
        await nextTick()

        expect(spies.getSource).toHaveBeenCalledWith(STORES_SOURCE_ID)
        expect(spies.setData).toHaveBeenCalledTimes(1)
        expect(spies.setData).toHaveBeenCalledWith(sampleFeatureCollection)
    })

    it('Should not recreate the source when the feature collection changes repeatedly', async () => {
        const { fakeMap, spies } = createFakeMap()
        const mapRef = shallowRef<typeof fakeMap | null>(null)
        const fcRef = shallowRef(emptyFeatureCollection)

        scope.run(() => {
            useStoreSource(mapRef as never, fcRef)
        })

        mapRef.value = fakeMap
        await nextTick()

        fcRef.value = sampleFeatureCollection
        await nextTick()
        fcRef.value = emptyFeatureCollection
        await nextTick()

        expect(spies.addSource).toHaveBeenCalledTimes(1)
        expect(spies.setData).toHaveBeenCalledTimes(2)
    })
})
