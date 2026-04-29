<script setup lang="ts">
import type { StoreStatusNext } from '~~/shared/types/storeStatus'

defineProps<{ next: StoreStatusNext | null }>()

const { t, d } = useI18n()
</script>

<template>
    <span
        v-if="next"
        class="text-sm text-neutral-600"
    >
        {{ t(next.key, {
            time: d(next.at, 'time'),
            weekday: d(next.at, 'weekday'),
        }) }}
    </span>
</template>
