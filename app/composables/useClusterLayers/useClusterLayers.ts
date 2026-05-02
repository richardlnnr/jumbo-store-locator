import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'
import type { ShallowRef } from 'vue'
import { watch } from 'vue'

import { STORES_SOURCE_ID } from '../useStoreSource/useStoreSource'

const CLUSTERS_HALO_LAYER_ID = 'clusters-halo'
const CLUSTERS_LAYER_ID = 'clusters'
const CLUSTER_COUNT_LAYER_ID = 'cluster-count'

const CLUSTER_BEFORE_LAYER_ID = 'building-entrance'

// Mirrors --color-yellow-500 (tokens.css). Mapbox paint expressions are JSON,
// not CSS, so they cannot read CSS custom properties at runtime; the hexes
// below duplicate token values intentionally.
const CLUSTER_FILL_COLOR = '#eeb717' // --color-yellow-500
const CLUSTER_HALO_COLOR = 'rgba(238, 183, 23, 0.25)' // --color-yellow-500 at 25% alpha
const CLUSTER_STROKE_COLOR = '#ffffff' // pure white (no design token)
const CLUSTER_TEXT_COLOR = '#171717' // --color-neutral-950

type ClusterClickEvent = {
    features?: Array<{
        properties?: Record<string, unknown> | null
        geometry: GeoJSON.Geometry
    }>
}

const addClusterLayers = (instance: MapboxMap) => {
    instance.addLayer({
        id: CLUSTERS_HALO_LAYER_ID,
        type: 'circle',
        source: STORES_SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': CLUSTER_HALO_COLOR,
            'circle-radius': ['step', ['get', 'point_count'], 15, 10, 19, 50, 22],
        },
    }, CLUSTER_BEFORE_LAYER_ID)

    instance.addLayer({
        id: CLUSTERS_LAYER_ID,
        type: 'circle',
        source: STORES_SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': CLUSTER_FILL_COLOR,
            'circle-radius': ['step', ['get', 'point_count'], 11, 10, 14, 50, 17],
            'circle-stroke-color': CLUSTER_STROKE_COLOR,
            'circle-stroke-width': 2,
        },
    }, CLUSTER_BEFORE_LAYER_ID)

    instance.addLayer({
        id: CLUSTER_COUNT_LAYER_ID,
        type: 'symbol',
        source: STORES_SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
            'text-size': ['step', ['get', 'point_count'], 11, 10, 13, 50, 16],
            'text-allow-overlap': true,
            'text-ignore-placement': true,
        },
        paint: {
            'text-color': CLUSTER_TEXT_COLOR,
        },
    }, CLUSTER_BEFORE_LAYER_ID)
}

const handleClusterClick = (instance: MapboxMap, event: ClusterClickEvent) => {
    const feature = event.features?.[0]
    if (!feature) return
    const clusterId = feature.properties?.cluster_id
    if (typeof clusterId !== 'number') return
    const source = instance.getSource<GeoJSONSource>(STORES_SOURCE_ID)
    if (!source) return
    source.getClusterExpansionZoom(clusterId, (error, zoom) => {
        if (error || zoom == null) return
        const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates as [number, number]
        instance.easeTo({ center: [lng, lat], zoom })
    })
}

const registerClusterHandlers = (instance: MapboxMap) => {
    instance.on('click', CLUSTERS_HALO_LAYER_ID, event => handleClusterClick(instance, event))

    instance.on('mouseenter', CLUSTERS_HALO_LAYER_ID, () => {
        instance.getCanvas().style.cursor = 'pointer'
    })

    instance.on('mouseleave', CLUSTERS_HALO_LAYER_ID, () => {
        instance.getCanvas().style.cursor = ''
    })
}

const setupClusterLayers = (instance: MapboxMap) => {
    instance.on('load', () => {
        addClusterLayers(instance)
        registerClusterHandlers(instance)
    })
}

export const useClusterLayers = (map: ShallowRef<MapboxMap | null>) => {
    watch(map, (instance) => {
        if (!instance) return
        setupClusterLayers(instance)
    }, { immediate: true })
}
