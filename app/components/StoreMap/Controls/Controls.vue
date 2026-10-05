<script setup lang="ts">
import type { Map } from 'mapbox-gl'

defineProps<{
    map: Map
}>()
</script>

<template>
    <div
        data-slot="store-map-controls"
        class="pointer-events-none absolute right-4 bottom-4 z-10 flex flex-col items-end gap-3"
    >
        <StoreMapControlsLocator
            :map="map"
            class="pointer-events-auto"
        />
        <StoreMapControlsZoom
            :map="map"
            class="pointer-events-auto"
        />
    </div>
</template>
