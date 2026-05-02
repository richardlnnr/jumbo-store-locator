import type { Map as MapboxMap, MapOptions } from 'mapbox-gl'
import { getCurrentScope, onScopeDispose, ref, shallowRef } from 'vue'

export function useMapbox() {
    const { public: { mapboxToken } } = useRuntimeConfig()
    const map = shallowRef<MapboxMap | null>(null)
    const isMapLoaded = ref(false)

    async function createMap(options: MapOptions) {
        if (!import.meta.client) return null
        if (!mapboxToken) {
            throw new Error(
                'Mapbox access token is missing. Set NUXT_PUBLIC_MAPBOX_TOKEN in your .env.',
            )
        }

        const mapboxgl = (await import('mapbox-gl')).default
        mapboxgl.accessToken = mapboxToken
        map.value?.remove()
        isMapLoaded.value = false

        const instance = new mapboxgl.Map(options)
        instance.on('load', () => {
            isMapLoaded.value = true
        })
        map.value = instance
        return instance
    }

    if (getCurrentScope()) {
        onScopeDispose(() => {
            map.value?.remove()
            map.value = null
            isMapLoaded.value = false
        })
    }

    return { createMap, map, isMapLoaded }
}
