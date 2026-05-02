<script setup lang="ts">
import { computed } from 'vue'

import type { StoreAddress } from '~~/shared/types/store'

const props = defineProps<{
    address: StoreAddress
}>()

const addressLine1 = computed(() => {
    const { street, houseNumber } = props.address
    return houseNumber ? `${street} ${houseNumber}` : street
})

const addressLine2 = computed(() => {
    const { postalCode, city } = props.address
    return `${postalCode} ${city}`
})
</script>

<template>
    <section class="flex gap-3 border-t border-neutral-100 px-5 py-4">
        <UIcon
            name="i-lucide-map-pin"
            class="mt-0.5 size-4.5 shrink-0 text-neutral-600"
        />
        <div class="flex min-w-0 flex-1 flex-col gap-1">
            <p class="text-sm font-semibold text-neutral-950">
                {{ addressLine1 }}
            </p>
            <p class="text-[13px] text-neutral-600">
                {{ addressLine2 }}
            </p>
        </div>
    </section>
</template>
