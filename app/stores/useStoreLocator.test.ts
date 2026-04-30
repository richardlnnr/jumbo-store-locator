import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import {
    AMSTERDAM,
    amsterdamCentrumFeature,
    amsterdamSouthFeature,
    eindhovenFeature,
    sundayOnlyFeature,
} from '../../shared/types/store.mock'
import type { JumboStoreFeatureCollection } from '../../shared/types/geojson'
import { useStoreLocator } from './useStoreLocator'

const fixedNow = new Date(2025, 0, 7, 14, 0, 0)

const sampleFeatureCollection: JumboStoreFeatureCollection = {
    type: 'FeatureCollection',
    features: [eindhovenFeature, amsterdamCentrumFeature, amsterdamSouthFeature, sundayOnlyFeature],
}

const fetchMock = vi.fn<() => Promise<JumboStoreFeatureCollection>>()

const flushDebounce = async () => {
    await vi.advanceTimersByTimeAsync(250)
}

beforeEach(() => {
    setActivePinia(createPinia())
    fetchMock.mockReset()
    vi.stubGlobal('$fetch', fetchMock)
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)
})

afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

describe('useStoreLocator', () => {
    it('Should default all state fields to their empty values', () => {
        const store = useStoreLocator()

        expect(store.featureCollection).toBeNull()
        expect(store.loading).toBe(false)
        expect(store.error).toBeNull()
        expect(store.selectedStoreId).toBeNull()
        expect(store.userLocation).toBeNull()
        expect(store.query).toBe('')
        expect(store.cityFilter).toEqual([])
        expect(store.openOnly).toBe(false)
    })

    it('Should expose an empty FeatureCollection from filteredFeatureCollection before fetch', () => {
        const store = useStoreLocator()

        expect(store.filteredFeatureCollection).toEqual({
            type: 'FeatureCollection',
            features: [],
        })
        expect(store.cities).toEqual([])
    })

    it('Should populate featureCollection on a successful fetch and clear loading/error', async () => {
        fetchMock.mockResolvedValueOnce(sampleFeatureCollection)
        const store = useStoreLocator()

        await store.fetchStores()

        expect(store.featureCollection).toEqual(sampleFeatureCollection)
        expect(store.loading).toBe(false)
        expect(store.error).toBeNull()
    })

    it('Should expose a sanitized error and leave featureCollection null on a failed fetch', async () => {
        const upstream = new Error('boom: /Users/secret/path stack frame')
        fetchMock.mockRejectedValueOnce(upstream)
        const store = useStoreLocator()

        await store.fetchStores()

        expect(store.featureCollection).toBeNull()
        expect(store.error).toBeInstanceOf(Error)
        expect(store.error?.message).toBe('Unable to load stores')
        expect(store.error).not.toBe(upstream)
        expect(store.loading).toBe(false)
    })

    it('Should be idempotent — calling fetchStores twice issues one network request', async () => {
        fetchMock.mockResolvedValue(sampleFeatureCollection)
        const store = useStoreLocator()

        await store.fetchStores()
        await store.fetchStores()

        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('Should re-fetch after a failure when fetchStores is called again', async () => {
        fetchMock.mockRejectedValueOnce(new Error('first attempt failed'))
        fetchMock.mockResolvedValueOnce(sampleFeatureCollection)
        const store = useStoreLocator()

        await store.fetchStores()
        await store.fetchStores()

        expect(fetchMock).toHaveBeenCalledTimes(2)
        expect(store.featureCollection).toEqual(sampleFeatureCollection)
        expect(store.error).toBeNull()
    })

    it('Should look up a store by id via storeById and return null for unknown ids', async () => {
        fetchMock.mockResolvedValueOnce(sampleFeatureCollection)
        const store = useStoreLocator()

        await store.fetchStores()

        expect(store.storeById('amsterdam-1')).toBe(amsterdamCentrumFeature.properties)
        expect(store.storeById('does-not-exist')).toBeNull()
    })

    it('Should derive selectedStore from selectedStoreId via storeById', async () => {
        fetchMock.mockResolvedValueOnce(sampleFeatureCollection)
        const store = useStoreLocator()
        await store.fetchStores()

        store.selectStore('eindhoven-1')

        expect(store.selectedStore).toBe(eindhovenFeature.properties)
    })

    it('Should clear the selection without affecting userLocation', async () => {
        fetchMock.mockResolvedValueOnce(sampleFeatureCollection)
        const store = useStoreLocator()
        await store.fetchStores()
        store.selectStore('amsterdam-1')
        store.setUserLocation(AMSTERDAM)

        store.clearSelection()

        expect(store.selectedStoreId).toBeNull()
        expect(store.selectedStore).toBeNull()
        expect(store.userLocation).toEqual(AMSTERDAM)
    })

    it('Should expose cities as a unique sorted list derived from features', async () => {
        fetchMock.mockResolvedValueOnce(sampleFeatureCollection)
        const store = useStoreLocator()

        await store.fetchStores()

        expect(store.cities).toEqual(['Amsterdam', 'Eindhoven', 'Utrecht'])
    })

    it('Should reflect cityFilter changes in filteredFeatureCollection', async () => {
        fetchMock.mockResolvedValueOnce(sampleFeatureCollection)
        const store = useStoreLocator()
        await store.fetchStores()

        store.setCityFilter(['AMSTERDAM'])

        const ids = store.filteredFeatureCollection.features.map(feature => feature.properties.storeId)
        expect(ids.sort()).toEqual(['amsterdam-1', 'amsterdam-2'])
    })

    it('Should include features from any of the cities in a multi-city cityFilter', async () => {
        fetchMock.mockResolvedValueOnce(sampleFeatureCollection)
        const store = useStoreLocator()
        await store.fetchStores()

        store.setCityFilter(['AMSTERDAM', 'EINDHOVEN'])

        const ids = store.filteredFeatureCollection.features.map(feature => feature.properties.storeId)
        expect(ids.sort()).toEqual(['amsterdam-1', 'amsterdam-2', 'eindhoven-1'])
    })

    it('Should reflect openOnly changes in filteredFeatureCollection', async () => {
        fetchMock.mockResolvedValueOnce(sampleFeatureCollection)
        const store = useStoreLocator()
        await store.fetchStores()

        store.setOpenOnly(true)

        const ids = store.filteredFeatureCollection.features.map(feature => feature.properties.storeId)
        expect(ids).not.toContain('sunday-only')
        expect(ids).toContain('amsterdam-1')
    })

    it('Should debounce query by 200ms before applying to filteredFeatureCollection', async () => {
        fetchMock.mockResolvedValueOnce(sampleFeatureCollection)
        const store = useStoreLocator()
        await store.fetchStores()

        store.setQuery('eindhoven')
        const idsBeforeDebounce = store.filteredFeatureCollection.features.map(feature => feature.properties.storeId)
        expect(idsBeforeDebounce.length).toBeGreaterThan(1)

        await flushDebounce()

        const idsAfterDebounce = store.filteredFeatureCollection.features.map(feature => feature.properties.storeId)
        expect(idsAfterDebounce).toEqual(['eindhoven-1'])
    })

    it('Should sort filteredFeatureCollection by distance when userLocation is set', async () => {
        fetchMock.mockResolvedValueOnce(sampleFeatureCollection)
        const store = useStoreLocator()
        await store.fetchStores()

        store.setCityFilter(['AMSTERDAM'])
        store.setUserLocation(AMSTERDAM)

        const ids = store.filteredFeatureCollection.features.map(feature => feature.properties.storeId)
        expect(ids).toEqual(['amsterdam-1', 'amsterdam-2'])
    })

    it('Should reset all filter values via clearFilters', async () => {
        fetchMock.mockResolvedValueOnce(sampleFeatureCollection)
        const store = useStoreLocator()
        await store.fetchStores()
        store.setQuery('eindhoven')
        await flushDebounce()
        store.setCityFilter(['EINDHOVEN'])
        store.setOpenOnly(true)

        store.clearFilters()
        await flushDebounce()

        expect(store.query).toBe('')
        expect(store.cityFilter).toEqual([])
        expect(store.openOnly).toBe(false)
        expect(store.filteredFeatureCollection.features.length).toBe(sampleFeatureCollection.features.length)
    })
})
