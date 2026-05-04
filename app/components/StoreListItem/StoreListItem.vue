<script setup lang="ts">
import type { DistanceLabel } from '~~/shared/types/distance'
import type { JumboStore } from '~~/shared/types/store'

const props = defineProps<{
    store: JumboStore
    distanceLabel?: DistanceLabel | null
    selected?: boolean
}>()

defineEmits<{ select: [] }>()

const status = computed(() => getStoreStatus(props.store, new Date()))

const addressLine = computed(() => {
    const { street, houseNumber, postalCode, city } = props.store.location.address
    const streetLine = houseNumber ? `${street} ${houseNumber}` : street
    return `${streetLine}, ${postalCode} ${city}`
})

const containerClass = computed(() => [
    'flex w-full items-start gap-4 rounded-none border-b border-l-[3px] border-l-transparent border-neutral-100 bg-white px-6 py-4 text-left hover:bg-neutral-50',
    props.selected && 'border-l-4 border-l-yellow-500 bg-yellow-50 hover:bg-yellow-50',
])
</script>

<template>
    <UButton
        color="neutral"
        variant="ghost"
        :ui="{ base: containerClass }"
        :aria-pressed="selected ?? false"
        @click="$emit('select')"
    >
        <div class="flex min-w-0 flex-1 flex-col gap-2">
            <div class="flex items-center justify-between gap-2">
                <UTooltip :text="store.name">
                    <span
                        data-slot="name"
                        class="block min-w-0 truncate font-bold text-neutral-900"
                    >
                        {{ store.name }}
                    </span>
                </UTooltip>
                <DistanceText
                    :label="distanceLabel ?? null"
                    class="shrink-0"
                />
            </div>
            <span class="text-sm text-neutral-600">{{ addressLine }}</span>
            <div class="flex items-center gap-2 pt-1">
                <StatusPill :is-open="status.isOpen" />
                <StoreStatusText :next="status.next" />
            </div>
        </div>
    </UButton>
</template>
