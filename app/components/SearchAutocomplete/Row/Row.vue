<script setup lang="ts">
import type { DistanceLabel } from '~~/shared/types/distance'
import type { JumboStoreFeature } from '~~/shared/types/geojson'
import type { CitySuggestion } from '~~/shared/types/storeSuggestion'
import { formatCityName } from '~~/shared/utils/cityName/cityName'

const props = defineProps<{
    variant: 'store' | 'city'
    feature?: JumboStoreFeature
    city?: CitySuggestion
    distanceLabel?: DistanceLabel | null
    query: string
    active?: boolean
}>()

const { t } = useI18n()

const storeStatus = computed(() => {
    if (props.variant !== 'store' || !props.feature) return null
    return getStoreStatus(props.feature.properties, new Date())
})

const titleText = computed(() => {
    if (props.variant === 'store') return props.feature?.properties.name ?? ''
    return props.city?.name ?? ''
})

const titleSegments = computed(() => highlightMatch(titleText.value, props.query))

const subline = computed(() => {
    if (props.variant === 'store' && props.feature) {
        const cityName = formatCityName(props.feature.properties.location.address.city)
        if (props.distanceLabel) {
            return `${cityName} · ${t(props.distanceLabel.key, { distance: props.distanceLabel.distance })}`
        }
        return cityName
    }
    if (props.variant === 'city' && props.city) {
        return t('search-autocomplete.city-stores-count', {
            count: props.city.storesCount,
            province: props.city.state,
        })
    }
    return ''
})

const containerClass = computed(() => [
    'flex w-full items-center gap-3 px-4 py-2.5 text-left',
    props.active && 'bg-yellow-50',
])
</script>

<template>
    <div
        :class="containerClass"
        :aria-label="titleText"
    >
        <span
            v-if="variant === 'store'"
            data-slot="pin"
            class="flex size-8 shrink-0 items-center justify-center rounded-full bg-yellow-500 text-sm font-extrabold text-yellow-900 shadow-[0_1px_2px_rgba(71,55,7,0.18)]"
            aria-hidden="true"
        >
            J
        </span>
        <span
            v-else
            data-slot="pin"
            class="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600"
            aria-hidden="true"
        >
            <UIcon
                name="i-lucide-map-pin"
                class="size-4"
            />
        </span>

        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span
                data-slot="title"
                class="truncate text-[15px] leading-5 font-medium tracking-[-0.005em] text-neutral-900"
                aria-hidden="true"
            >
                <template
                    v-for="(segment, index) in titleSegments"
                    :key="index"
                >
                    <span
                        v-if="segment.bold"
                        class="font-bold"
                    >{{ segment.text }}</span>
                    <template v-else>{{ segment.text }}</template>
                </template>
            </span>
            <span
                data-slot="subline"
                class="truncate text-[13px] leading-[18px] text-neutral-600"
            >
                {{ subline }}
            </span>
        </div>

        <span
            v-if="storeStatus"
            data-slot="status"
            class="shrink-0"
        >
            <StatusPill :is-open="storeStatus.isOpen" />
        </span>
    </div>
</template>
