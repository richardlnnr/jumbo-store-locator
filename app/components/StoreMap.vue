<script setup lang="ts">
import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'

const STREETS_STYLE = 'mapbox://styles/mapbox/streets-v12'
const STORES_SOURCE_ID = 'stores'
const PIN_IMAGE_ID = 'jumbo-pin'
const PIN_IMAGE_URL = '/jumbo-pin.png'
const PINS_LAYER_ID = 'stores-pins'

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
        })

        await loadPinImage(instance)

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
