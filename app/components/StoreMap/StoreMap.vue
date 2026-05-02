<script setup lang="ts">
const STREETS_STYLE = 'mapbox://styles/mapbox/streets-v12'

const mapEl = useTemplateRef<HTMLDivElement>('mapEl')
const { createMap, map, isMapLoaded } = useMapbox()
const locator = useStoreLocator()
const { filteredFeatureCollection, selectedStore, userLocation } = storeToRefs(locator)

useStoreSource(map, filteredFeatureCollection)
useClusterLayers(map)
usePinLayer(map, locator.selectStore)

const { popupContainer } = useStorePopup({ map, selectedStore })

onMounted(async () => {
    if (!mapEl.value) return
    await createMap({
        container: mapEl.value,
        style: STREETS_STYLE,
        bounds: computeStoresBounds(filteredFeatureCollection.value),
        fitBoundsOptions: { padding: 48, maxZoom: 12 },
        minZoom: 6,
    })
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
        <Transition name="map-loading-fade">
            <MapLoadingOverlay v-if="!isMapLoaded" />
        </Transition>
        <Teleport
            v-if="selectedStore && popupContainer"
            :to="popupContainer"
        >
            <StorePopup
                :store="selectedStore"
                :user-location="userLocation"
                @close="locator.clearSelection"
            />
        </Teleport>
    </section>
</template>

<style scoped>
.map-loading-fade-leave-active {
    transition: opacity 200ms ease-out, transform 200ms ease-out;
}

.map-loading-fade-leave-to {
    opacity: 0;
    transform: translateY(4px);
}
</style>
