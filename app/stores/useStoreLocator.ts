import { refDebounced } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'

import type { JumboStoreFeatureCollection } from '../../shared/types/geojson'
import type { Coordinate, JumboStore } from '../../shared/types/store'
import { filterFeatures } from '../utils/filterFeatures/filterFeatures'

const QUERY_DEBOUNCE_MS = 200

const emptyFeatureCollection: JumboStoreFeatureCollection = {
    type: 'FeatureCollection',
    features: [],
}

export const useStoreLocator = defineStore('storeLocator', () => {
    const featureCollection = shallowRef<JumboStoreFeatureCollection | null>(null)
    const loading = ref(false)
    const error = ref<Error | null>(null)

    const selectedStoreId = ref<string | null>(null)
    const userLocation = ref<Coordinate | null>(null)

    const query = ref('')
    const cityFilter = ref<string[]>([])
    const openOnly = ref(false)

    const mobileView = ref<'list' | 'map'>('list')

    const debouncedQuery = refDebounced(query, QUERY_DEBOUNCE_MS)

    const storeByIdMap = computed(() => {
        const lookup = new Map<string, JumboStore>()
        const features = featureCollection.value?.features ?? []
        for (const feature of features) {
            lookup.set(feature.properties.storeId, feature.properties)
        }
        return lookup
    })

    const storeById = (id: string): JumboStore | null => storeByIdMap.value.get(id) ?? null

    const selectedStore = computed<JumboStore | null>(() =>
        selectedStoreId.value ? storeById(selectedStoreId.value) : null,
    )

    const cities = computed<string[]>(() => {
        const features = featureCollection.value?.features ?? []
        return [...new Set(features.map(feature => feature.properties.location.address.city))]
            .sort((cityA, cityB) => cityA.localeCompare(cityB))
    })

    const filteredFeatureCollection = computed<JumboStoreFeatureCollection>(() => {
        const source = featureCollection.value
        if (!source) return emptyFeatureCollection

        const features = filterFeatures({
            features: source.features,
            query: debouncedQuery.value,
            cityFilter: cityFilter.value,
            openOnly: openOnly.value,
            now: openOnly.value ? new Date() : null,
            userLocation: userLocation.value,
        })

        if (features.length === 0) return emptyFeatureCollection

        return { type: 'FeatureCollection', features }
    })

    async function fetchStores(): Promise<void> {
        if (featureCollection.value) return
        loading.value = true
        error.value = null
        try {
            featureCollection.value = await $fetch<JumboStoreFeatureCollection>('/api/stores')
        }
        catch (error_) {
            if (import.meta.server) {
                console.error('[useStoreLocator] fetchStores failed', error_)
            }
            error.value = new Error('Unable to load stores')
        }
        finally {
            loading.value = false
        }
    }

    function selectStore(id: string): void {
        selectedStoreId.value = id
    }

    function clearSelection(): void {
        selectedStoreId.value = null
    }

    function setUserLocation(coordinate: Coordinate | null): void {
        userLocation.value = coordinate
    }

    function setQuery(value: string): void {
        query.value = value
    }

    function setCityFilter(value: string[]): void {
        cityFilter.value = [...value]
    }

    function setOpenOnly(value: boolean): void {
        openOnly.value = value
    }

    function clearFilters(): void {
        query.value = ''
        cityFilter.value = []
        openOnly.value = false
    }

    function setMobileView(view: 'list' | 'map'): void {
        mobileView.value = view
    }

    return {
        featureCollection,
        loading,
        error,
        selectedStoreId,
        userLocation,
        query,
        cityFilter,
        openOnly,
        mobileView,
        filteredFeatureCollection,
        cities,
        storeById,
        selectedStore,
        fetchStores,
        selectStore,
        clearSelection,
        setUserLocation,
        setQuery,
        setCityFilter,
        setOpenOnly,
        clearFilters,
        setMobileView,
    }
})
