<script setup lang="ts">
const AMERSFOORT: [number, number] = [5.387957, 52.155576]

const mapEl = useTemplateRef<HTMLDivElement>('mapEl')
const { createMap } = useMapbox()

onMounted(async () => {
    if (!mapEl.value) return
    await createMap({
        container: mapEl.value,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: AMERSFOORT,
        zoom: 8,
    })
})
</script>

<template>
    <div
        ref="mapEl"
        class="h-full w-full"
    />
</template>
