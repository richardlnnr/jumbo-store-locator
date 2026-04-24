import type { Map as MapboxMap, MapOptions } from 'mapbox-gl'
import { getCurrentScope, onScopeDispose, shallowRef } from 'vue'

export function useMapbox() {
    const { public: { mapboxToken } } = useRuntimeConfig()
    const map = shallowRef<MapboxMap | null>(null)

    async function createMap(options: MapOptions) {
        if (!import.meta.client) return null
        if (!mapboxToken) {
            throw new Error(
                'Mapbox access token is missing. Set NUXT_PUBLIC_MAPBOX_TOKEN in your .env.',
            )
        }

        const mapboxgl = (await import('mapbox-gl')).default
        mapboxgl.accessToken = mapboxToken
        map.value = new mapboxgl.Map(options)
        return map.value
    }

    if (getCurrentScope()) {
        onScopeDispose(() => {
            map.value?.remove()
            map.value = null
        })
    }

    return { createMap, map }
}
