<script setup lang="ts">
import type { GeoJSONSource } from 'mapbox-gl'

const STREETS_STYLE = 'mapbox://styles/mapbox/streets-v12'
const STORES_SOURCE_ID = 'stores'

const mapEl = useTemplateRef<HTMLDivElement>('mapEl')
const { createMap, map } = useMapbox()
const locator = useStoreLocator()
const { filteredFeatureCollection } = storeToRefs(locator)

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

    instance.on('load', () => {
        instance.addSource(STORES_SOURCE_ID, {
            type: 'geojson',
            data: filteredFeatureCollection.value,
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
