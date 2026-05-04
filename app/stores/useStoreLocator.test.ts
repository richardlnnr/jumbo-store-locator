import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import {
    AMSTERDAM,
    amsterdamCentrumFeature,
    amsterdamNorthFeature,
    amsterdamSouthFeature,
    buildFeature,
    buildStore,
    eindhovenFeature,
    everyDay,
    hours,
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
        expect(store.searchTerm).toBe('')
        expect(store.cityFilter).toEqual([])
        expect(store.openOnly).toBe(false)
        expect(store.mobileView).toBe('list')
        expect(store.pendingSelectionId).toBeNull()
    })

    it('Should update mobileView via setMobileView', () => {
        const store = useStoreLocator()

        store.setMobileView('map')

        expect(store.mobileView).toBe('map')

        store.setMobileView('list')

        expect(store.mobileView).toBe('list')
    })

    it('Should set pendingSelectionId and flip mobileView to map via queuePendingSelection', () => {
        const store = useStoreLocator()

        store.queuePendingSelection('amsterdam-1')

        expect(store.pendingSelectionId).toBe('amsterdam-1')
        expect(store.mobileView).toBe('map')
        expect(store.selectedStoreId).toBeNull()
    })

    it('Should call selectStore and clear pendingSelectionId via flushPendingSelection', () => {
        const store = useStoreLocator()
        store.queuePendingSelection('amsterdam-1')

        store.flushPendingSelection()

        expect(store.selectedStoreId).toBe('amsterdam-1')
        expect(store.pendingSelectionId).toBeNull()
    })

    it('Should be a no-op when flushPendingSelection is called without a queued selection', () => {
        const store = useStoreLocator()

        store.flushPendingSelection()

        expect(store.selectedStoreId).toBeNull()
        expect(store.pendingSelectionId).toBeNull()
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
        store.setSearchTerm('eindhoven')

        store.clearFilters()
        await flushDebounce()

        expect(store.query).toBe('')
        expect(store.searchTerm).toBe('')
        expect(store.cityFilter).toEqual([])
        expect(store.openOnly).toBe(false)
        expect(store.filteredFeatureCollection.features.length).toBe(sampleFeatureCollection.features.length)
    })

    it('Should write to searchTerm via setSearchTerm without touching query', () => {
        const store = useStoreLocator()

        store.setSearchTerm('amst')

        expect(store.searchTerm).toBe('amst')
        expect(store.query).toBe('')
    })

    it('Should copy searchTerm to query when applySearchTerm is called', () => {
        const store = useStoreLocator()

        store.setSearchTerm('amsterdam')
        store.applySearchTerm()

        expect(store.query).toBe('amsterdam')
    })

    it('Should restore searchTerm from query when revertSearchTerm is called', () => {
        const store = useStoreLocator()
        store.setSearchTerm('amsterdam')
        store.applySearchTerm()
        store.setSearchTerm('eindhov')

        store.revertSearchTerm()

        expect(store.searchTerm).toBe('amsterdam')
    })

    it('Should expose empty autocomplete suggestions when the typing buffer is empty', () => {
        const store = useStoreLocator()
        store.featureCollection = sampleFeatureCollection

        expect(store.autocompleteSuggestions).toEqual({
            topStores: [],
            isStoresCapped: false,
            topCities: [],
            isCitiesCapped: false,
        })
    })

    it('Should expose ranked autocomplete store and city suggestions for the active typing buffer', () => {
        const store = useStoreLocator()
        store.featureCollection = sampleFeatureCollection

        store.setSearchTerm('amsterdam')

        const suggestions = store.autocompleteSuggestions
        expect(suggestions.topStores.map(feature => feature.properties.storeId))
            .toEqual([amsterdamCentrumFeature.properties.storeId, amsterdamSouthFeature.properties.storeId])
        expect(suggestions.topCities).toHaveLength(1)
        expect(suggestions.topCities[0]).toMatchObject({
            name: 'Amsterdam',
            rawName: 'Amsterdam',
            state: 'Noord-Holland',
            storesCount: 2,
        })
    })

    it('Should cap autocomplete topStores at five and flag isStoresCapped when more than five match', () => {
        const sixAmsterdam = Array.from({ length: 6 }, (_, index) =>
            buildFeature(buildStore(everyDay(hours('08:00', '22:00')), {
                storeId: `s-${index}`,
                name: `Jumbo Amsterdam ${index}`,
                location: {
                    latitude: 52,
                    longitude: 5,
                    address: {
                        street: 'Test',
                        houseNumber: '1',
                        postalCode: '0000AA',
                        city: 'Amsterdam',
                        state: 'Noord-Holland',
                        countryCode: 'NL',
                    },
                },
            })),
        )
        const store = useStoreLocator()
        store.featureCollection = { type: 'FeatureCollection', features: sixAmsterdam }

        store.setSearchTerm('amsterdam')

        expect(store.autocompleteSuggestions.topStores).toHaveLength(5)
        expect(store.autocompleteSuggestions.isStoresCapped).toBe(true)
    })

    it('Should rank a city whose name starts with the query above cities that only match through their stores', () => {
        const helmondStore = buildFeature(buildStore(everyDay(hours('08:00', '22:00')), {
            storeId: 'h-1',
            name: 'Jumbo Helmond Centrum',
            location: {
                latitude: 51.4816,
                longitude: 5.6614,
                address: {
                    street: 'Test',
                    houseNumber: '1',
                    postalCode: '5701AA',
                    city: 'Helmond',
                    state: 'Noord-Brabant',
                    countryCode: 'NL',
                },
            },
        }))
        const groningenStoreWithHelmInName = buildFeature(buildStore(everyDay(hours('08:00', '22:00')), {
            storeId: 'g-1',
            name: 'Jumbo Groningen Helmertspark',
            location: {
                latitude: 53.2194,
                longitude: 6.5665,
                address: {
                    street: 'Test',
                    houseNumber: '1',
                    postalCode: '9711AA',
                    city: 'Groningen',
                    state: 'Groningen',
                    countryCode: 'NL',
                },
            },
        }))
        const store = useStoreLocator()
        store.featureCollection = {
            type: 'FeatureCollection',
            features: [groningenStoreWithHelmInName, helmondStore],
        }

        store.setSearchTerm('Helm')

        expect(store.autocompleteSuggestions.topCities[0]?.rawName).toBe('Helmond')
    })

    it('Should report storesCount per city using the unfiltered feature collection', () => {
        const store = useStoreLocator()
        store.featureCollection = {
            type: 'FeatureCollection',
            features: [eindhovenFeature, amsterdamCentrumFeature, amsterdamSouthFeature, amsterdamNorthFeature],
        }

        store.setSearchTerm('centrum')

        const amsterdamCity = store.autocompleteSuggestions.topCities
            .find(city => city.rawName.toLowerCase() === 'amsterdam')
        expect(amsterdamCity?.storesCount).toBe(3)
    })

    it('Should auto-apply the typing buffer to query after a debounced shortening keystroke', async () => {
        const store = useStoreLocator()
        store.setSearchTerm('helmond')
        store.applySearchTerm()
        expect(store.query).toBe('helmond')

        store.setSearchTerm('hel')
        await vi.advanceTimersByTimeAsync(350)

        expect(store.query).toBe('hel')
    })

    it('Should auto-apply an empty buffer when the user clears the input via repeated deletions', async () => {
        const store = useStoreLocator()
        store.setSearchTerm('helmond')
        store.applySearchTerm()

        store.setSearchTerm('')
        await vi.advanceTimersByTimeAsync(350)

        expect(store.query).toBe('')
    })

    it('Should cancel a pending shrink-apply when the buffer grows again before the debounce fires', async () => {
        const store = useStoreLocator()
        store.setSearchTerm('helmond')
        store.applySearchTerm()

        store.setSearchTerm('hel')
        await vi.advanceTimersByTimeAsync(150)
        store.setSearchTerm('helping')
        await vi.advanceTimersByTimeAsync(500)

        expect(store.query).toBe('helmond')
    })
})
