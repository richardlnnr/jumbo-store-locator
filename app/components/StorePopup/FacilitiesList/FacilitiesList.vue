<script setup lang="ts">
import { computed } from 'vue'

import type { StoreFacilities } from '~~/shared/types/store'

const props = defineProps<{
    facilities: StoreFacilities
}>()

const { t } = useI18n()

const facilityChips = computed(() => getStoreFacilityChips(props.facilities))
</script>

<template>
    <section
        v-if="facilityChips.length"
        class="flex flex-col gap-3 border-t border-neutral-100 px-5 py-4"
    >
        <h3 class="text-[13px] font-bold tracking-wider text-neutral-950 uppercase">
            {{ t('store-popup.facilities') }}
        </h3>
        <ul class="flex flex-wrap gap-2">
            <li
                v-for="key in facilityChips"
                :key="key"
                class="rounded-lg bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-950"
            >
                {{ t(key) }}
            </li>
        </ul>
    </section>
</template>
