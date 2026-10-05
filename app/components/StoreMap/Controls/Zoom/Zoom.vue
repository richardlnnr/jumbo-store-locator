<script setup lang="ts">
import type { Map } from 'mapbox-gl'

const props = defineProps<{
    map: Map
}>()

const { t } = useI18n()

const minZoom = ref(props.map.getMinZoom?.() ?? 0)
const maxZoom = ref(props.map.getMaxZoom?.() ?? 22)
const currentZoom = ref(props.map.getZoom?.() ?? 0)

const syncZoom = (): void => {
    currentZoom.value = props.map.getZoom?.() ?? currentZoom.value
}

onMounted(() => {
    props.map.on?.('zoom', syncZoom)
    props.map.on?.('zoomend', syncZoom)
})

onBeforeUnmount(() => {
    props.map.off?.('zoom', syncZoom)
    props.map.off?.('zoomend', syncZoom)
})

const isAtMax = computed(() => currentZoom.value >= maxZoom.value)
const isAtMin = computed(() => currentZoom.value <= minZoom.value)

const onZoomIn = (): void => {
    props.map.zoomIn?.()
}
const onZoomOut = (): void => {
    props.map.zoomOut?.()
}
</script>

<template>
    <div
        data-slot="zoom-controls"
        class="flex w-10 flex-col overflow-hidden rounded-full bg-white shadow-md"
    >
        <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-plus"
            :aria-label="t('store-map.zoom-in')"
            :disabled="isAtMax"
            :ui="{
                base: 'size-10 justify-center rounded-none p-0 ring-0 hover:bg-neutral-50',
                leadingIcon: ['size-4', isAtMax ? 'text-neutral-400' : 'text-neutral-900'],
            }"
            @click="onZoomIn"
        />
        <span
            aria-hidden="true"
            class="mx-auto block h-px w-6 shrink-0 bg-neutral-200"
        />
        <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-minus"
            :aria-label="t('store-map.zoom-out')"
            :disabled="isAtMin"
            :ui="{
                base: 'size-10 justify-center rounded-none p-0 ring-0 hover:bg-neutral-50',
                leadingIcon: ['size-4', isAtMin ? 'text-neutral-400' : 'text-neutral-900'],
            }"
            @click="onZoomOut"
        />
    </div>
</template>
