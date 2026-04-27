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
    <div class="bg-neutral-50/10 border border-neutral-200 dark:bg-neutral-950/5 dark:border-neutral-800 overflow-hidden rounded-lg">
        <div
            ref="mapEl"
            class="h-[400px] w-full"
        />
    </div>
</template>
