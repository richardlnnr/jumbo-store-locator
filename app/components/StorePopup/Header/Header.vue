<script setup lang="ts">
import { computed } from 'vue'

import type { Coordinate, JumboStore } from '~~/shared/types/store'

const props = defineProps<{
    store: JumboStore
    userLocation?: Coordinate | null
}>()

const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()

const status = computed(() => getStoreStatus(props.store, new Date()))

const typeLabel = computed(() => t(
    `store-popup.location-type.${props.store.facilities.locationType.toLowerCase().replaceAll('_', '-')}`,
))

const distanceLabel = computed(() =>
    props.userLocation
        ? getDistanceLabel(props.userLocation, props.store.location)
        : null,
)

const subtitle = computed(() => {
    if (distanceLabel.value) {
        const distance = t(distanceLabel.value.key, { distance: distanceLabel.value.distance })
        return t('store-popup.subtitle', { type: typeLabel.value, distance })
    }
    return t('store-popup.subtitle-no-distance', { type: typeLabel.value })
})
</script>

<template>
    <header class="flex shrink-0 flex-col gap-3 px-5 pt-5 pb-4">
        <div class="flex items-start gap-3">
            <UAvatar
                src="/jumbo-brand-avatar.png"
                :alt="t('store-popup.brand-alt')"
                :ui="{ root: 'size-12 shrink-0 rounded-full ring-0' }"
            />
            <div class="flex min-w-0 flex-1 flex-col gap-1 pt-1">
                <UTooltip :text="props.store.name">
                    <h2
                        data-slot="name"
                        class="truncate text-[17px] leading-tight font-black text-neutral-950"
                    >
                        {{ props.store.name }}
                    </h2>
                </UTooltip>
                <p class="truncate text-[13px] text-neutral-600">
                    {{ subtitle }}
                </p>
            </div>
            <UButton
                color="neutral"
                variant="solid"
                icon="i-lucide-x"
                :aria-label="t('store-popup.close')"
                :ui="{
                    base: 'size-7 shrink-0 rounded-full bg-neutral-100 p-0 text-neutral-950 hover:bg-neutral-200 ring-0 justify-center',
                    leadingIcon: 'size-3.5',
                }"
                @click="emit('close')"
            />
        </div>
        <div class="flex items-center gap-3">
            <StatusPill :is-open="status.isOpen" />
            <StoreStatusText
                :next="status.next"
                class="text-[13px] font-medium text-neutral-950"
            />
        </div>
    </header>
</template>
