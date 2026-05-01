<script setup lang="ts">
import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'

const STREETS_STYLE = 'mapbox://styles/mapbox/streets-v12'
const STORES_SOURCE_ID = 'stores'
const PIN_IMAGE_ID = 'jumbo-pin'
const PIN_IMAGE_URL = '/jumbo-pin.png'

const PINS_LAYER_ID = 'stores-pins'
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

const mapEl = useTemplateRef<HTMLDivElement>('mapEl')
const { createMap, map } = useMapbox()
const locator = useStoreLocator()
const { filteredFeatureCollection } = storeToRefs(locator)

const loadPinImage = (instance: MapboxMap) =>
    new Promise<void>((resolve, reject) => {
        if (instance.hasImage(PIN_IMAGE_ID)) {
            resolve()
            return
        }
        instance.loadImage(PIN_IMAGE_URL, (error, image) => {
            if (error || !image) {
                reject(error ?? new Error('Failed to load Jumbo pin image'))
                return
            }
            if (!instance.hasImage(PIN_IMAGE_ID)) {
                instance.addImage(PIN_IMAGE_ID, image, { pixelRatio: 2 })
            }
            resolve()
        })
    })

onMounted(async () => {
    if (!mapEl.value) return

    const instance = await createMap({
        container: mapEl.value,
        style: STREETS_STYLE,
        bounds: computeStoresBounds(filteredFeatureCollection.value),
        fitBoundsOptions: { padding: 48, maxZoom: 12 },
        minZoom: 6,
    })
    if (!instance) return

    instance.on('load', async () => {
        instance.addSource(STORES_SOURCE_ID, {
            type: 'geojson',
            data: filteredFeatureCollection.value,
            cluster: true,
            clusterRadius: 30,
            clusterMaxZoom: 10,
        })

        if (!instance.getLayer(CLUSTERS_HALO_LAYER_ID)) {
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
        }

        if (!instance.getLayer(CLUSTERS_LAYER_ID)) {
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
        }

        if (!instance.getLayer(CLUSTER_COUNT_LAYER_ID)) {
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
            },
            CLUSTER_BEFORE_LAYER_ID)
        }

        try {
            await loadPinImage(instance)
        }
        catch (error_) {
            console.error('[StoreMap] failed to load Jumbo pin image', error_)
            return
        }

        if (!instance.getLayer(PINS_LAYER_ID)) {
            instance.addLayer({
                id: PINS_LAYER_ID,
                type: 'symbol',
                source: STORES_SOURCE_ID,
                filter: ['!', ['has', 'point_count']],
                layout: {
                    'icon-image': PIN_IMAGE_ID,
                    'icon-size': ['interpolate', ['linear'], ['zoom'], 8, 0.3, 14, 0.5],
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': true,
                    'icon-anchor': 'bottom',
                },
            })
        }

        instance.on('click', CLUSTERS_HALO_LAYER_ID, (event) => {
            const feature = event.features?.[0]
            if (!feature) return
            const clusterId = feature.properties?.cluster_id
            if (typeof clusterId !== 'number') return
            const source = instance.getSource(STORES_SOURCE_ID) as GeoJSONSource
            source.getClusterExpansionZoom(clusterId, (error_, zoom) => {
                if (error_ || zoom == null) return
                const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates as [number, number]
                instance.easeTo({ center: [lng, lat], zoom })
            })
        })

        instance.on('mouseenter', CLUSTERS_HALO_LAYER_ID, () => {
            instance.getCanvas().style.cursor = 'pointer'
        })

        instance.on('mouseleave', CLUSTERS_HALO_LAYER_ID, () => {
            instance.getCanvas().style.cursor = ''
        })
    })
})

watch(filteredFeatureCollection, (next) => {
    const source = map.value?.getSource(STORES_SOURCE_ID) as
        | GeoJSONSource
        | undefined
    source?.setData(next)
})
</script>

<template>
    <section
        role="region"
        class="relative h-full w-full"
    >
        <div
            ref="mapEl"
            class="h-full w-full"
        />
    </section>
</template>
