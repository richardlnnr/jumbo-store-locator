import { refDebounced } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref, shallowRef, watch } from 'vue'

import type { JumboStoreFeatureCollection } from '../../shared/types/geojson'
import type { MobileView } from '../../shared/types/mobileView'
import type { Coordinate, JumboStore } from '../../shared/types/store'
import type { AutocompleteSuggestions } from '../../shared/types/storeSuggestion'
import { formatCityName } from '../../shared/utils/cityName/cityName'
import { aggregateCities } from '../utils/aggregateCities/aggregateCities'
import { filterFeatures } from '../utils/filterFeatures/filterFeatures'
import { matchFeatures } from '../utils/matchFeatures/matchFeatures'
import { rankCities } from '../utils/rankCities/rankCities'
import { rankFeatures } from '../utils/rankFeatures/rankFeatures'

const QUERY_DEBOUNCE_MS = 200
const SHRINK_APPLY_DEBOUNCE_MS = 300

export const SUGGESTION_STORE_LIMIT = 5
export const SUGGESTION_CITY_LIMIT = 5

const emptyFeatureCollection: JumboStoreFeatureCollection = {
    type: 'FeatureCollection',
    features: [],
}

const emptyAutocompleteSuggestions: AutocompleteSuggestions = {
    topStores: [],
    isStoresCapped: false,
    topCities: [],
    isCitiesCapped: false,
}

export const useStoreLocator = defineStore('storeLocator', () => {
    const featureCollection = shallowRef<JumboStoreFeatureCollection | null>(null)
    const loading = ref(false)
    const error = ref<Error | null>(null)

    const selectedStoreId = ref<string | null>(null)
    const userLocation = ref<Coordinate | null>(null)

    const query = ref('')
    const searchTerm = ref('')
    const cityFilter = ref<string[]>([])
    const openOnly = ref(false)

    const mobileView = ref<MobileView>('list')
    const pendingSelectionId = ref<string | null>(null)

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

    const storesPerCity = computed<Map<string, number>>(() => {
        const counts = new Map<string, number>()
        const features = featureCollection.value?.features ?? []
        for (const feature of features) {
            const key = feature.properties.location.address.city.toLowerCase()
            counts.set(key, (counts.get(key) ?? 0) + 1)
        }
        return counts
    })

    const autocompleteSuggestions = computed<AutocompleteSuggestions>(() => {
        const term = searchTerm.value.trim()
        const features = featureCollection.value?.features
        if (!term || !features?.length) return emptyAutocompleteSuggestions

        const matched = matchFeatures(features, term)
        const rankedStores = rankFeatures(matched, term)
        const rankedCities = rankCities(aggregateCities(matched), term)

        return {
            topStores: rankedStores.slice(0, SUGGESTION_STORE_LIMIT),
            isStoresCapped: rankedStores.length > SUGGESTION_STORE_LIMIT,
            topCities: rankedCities.slice(0, SUGGESTION_CITY_LIMIT).map(aggregate => ({
                name: formatCityName(aggregate.city),
                rawName: aggregate.city,
                state: aggregate.state,
                storesCount: storesPerCity.value.get(aggregate.city.toLowerCase()) ?? 0,
            })),
            isCitiesCapped: rankedCities.length > SUGGESTION_CITY_LIMIT,
        }
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

    function setSearchTerm(value: string): void {
        searchTerm.value = value
    }

    function applySearchTerm(): void {
        query.value = searchTerm.value
    }

    function revertSearchTerm(): void {
        searchTerm.value = query.value
    }

    function setCityFilter(value: string[]): void {
        cityFilter.value = [...value]
    }

    function setOpenOnly(value: boolean): void {
        openOnly.value = value
    }

    function clearFilters(): void {
        cancelShrinkApply()
        query.value = ''
        searchTerm.value = ''
        cityFilter.value = []
        openOnly.value = false
    }

    function setMobileView(view: MobileView): void {
        mobileView.value = view
    }

    function queuePendingSelection(id: string): void {
        pendingSelectionId.value = id
        mobileView.value = 'map'
    }

    function flushPendingSelection(): void {
        if (pendingSelectionId.value === null) return
        selectStore(pendingSelectionId.value)
        pendingSelectionId.value = null
    }

    let shrinkApplyTimer: ReturnType<typeof setTimeout> | null = null

    function cancelShrinkApply(): void {
        if (shrinkApplyTimer === null) return
        clearTimeout(shrinkApplyTimer)
        shrinkApplyTimer = null
    }

    watch(searchTerm, (current, previous = '') => {
        if (current.length >= previous.length) {
            cancelShrinkApply()
            return
        }
        cancelShrinkApply()
        shrinkApplyTimer = setTimeout(() => {
            shrinkApplyTimer = null
            applySearchTerm()
        }, SHRINK_APPLY_DEBOUNCE_MS)
    }, { flush: 'sync' })

    return {
        featureCollection,
        loading,
        error,
        selectedStoreId,
        userLocation,
        query,
        searchTerm,
        cityFilter,
        openOnly,
        mobileView,
        pendingSelectionId,
        filteredFeatureCollection,
        autocompleteSuggestions,
        cities,
        storeById,
        selectedStore,
        fetchStores,
        selectStore,
        clearSelection,
        setUserLocation,
        setQuery,
        setSearchTerm,
        applySearchTerm,
        revertSearchTerm,
        setCityFilter,
        setOpenOnly,
        clearFilters,
        setMobileView,
        queuePendingSelection,
        flushPendingSelection,
    }
})
