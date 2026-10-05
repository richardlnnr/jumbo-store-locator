<script setup lang="ts">
import type { Map } from 'mapbox-gl'

const props = defineProps<{
    map: Map
}>()

const { t } = useI18n()
const userLocation = useUserLocationStore()

type LocatorState = 'idle' | 'locating' | 'granted' | 'blocked' | 'retry'

const locatorState = computed<LocatorState>(() => {
    if (userLocation.state === 'loading') return 'locating'
    if (userLocation.permissionState === 'denied'
        || userLocation.permissionState === 'unsupported') return 'blocked'
    if (userLocation.source === 'precise') return 'granted'
    if (userLocation.error !== null
        && userLocation.error !== 'denied'
        && userLocation.error !== 'unsupported') return 'retry'
    return 'idle'
})

const iconForState: Record<LocatorState, string> = {
    idle: 'i-lucide-locate',
    locating: 'i-lucide-loader-2',
    granted: 'i-lucide-locate-fixed',
    blocked: 'i-lucide-locate-off',
    retry: 'i-lucide-rotate-ccw',
}

const tooltipKey = computed<`geolocation.locator-tooltip-${string}`>(() => {
    if (locatorState.value === 'locating') return 'geolocation.locator-tooltip-locating'
    if (locatorState.value === 'blocked') return 'geolocation.locator-tooltip-blocked'
    if (locatorState.value === 'retry') return 'geolocation.locator-tooltip-retry'
    if (locatorState.value === 'idle' && userLocation.source === 'coarse') {
        return 'geolocation.locator-tooltip-upgrade'
    }
    return 'geolocation.locator-tooltip-locate'
})

const isDisabled = computed(() => locatorState.value === 'locating'
    || locatorState.value === 'blocked')

const surfaceClass = computed(() => locatorState.value === 'granted'
    ? 'bg-yellow-50 hover:bg-yellow-200'
    : 'bg-white hover:bg-neutral-50')

const iconColorClass = computed(() => {
    if (locatorState.value === 'blocked') return 'text-red-500'
    return 'text-neutral-900'
})

const iconAnimationClass = computed(() =>
    locatorState.value === 'locating' ? 'animate-spin' : '')

const onClick = async (): Promise<void> => {
    if (isDisabled.value) return
    await userLocation.requestPrecise()
    if (userLocation.coordinate && userLocation.source === 'precise') {
        props.map.flyTo({
            center: [userLocation.coordinate.longitude, userLocation.coordinate.latitude],
            zoom: 13,
        })
    }
}
</script>

<template>
    <div
        data-slot="locator-button"
        :data-state="locatorState"
    >
        <UTooltip
            :text="t(tooltipKey)"
            :delay-duration="200"
        >
            <UButton
                color="neutral"
                variant="solid"
                :icon="iconForState[locatorState]"
                :aria-label="t(tooltipKey)"
                :disabled="isDisabled"
                :ui="{
                    base: ['size-10 justify-center rounded-full p-0 shadow-md ring-0', surfaceClass],
                    leadingIcon: ['size-5', iconColorClass, iconAnimationClass],
                }"
                @click="onClick"
            />
        </UTooltip>
    </div>
</template>
