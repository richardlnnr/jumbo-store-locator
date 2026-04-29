<script setup lang="ts">
import type { DistanceLabel } from '~~/shared/types/distance'

defineProps<{ label: DistanceLabel | null }>()

const { t } = useI18n()
</script>

<template>
    <span
        v-if="label"
        class="text-sm text-neutral-600"
    >
        {{ t(label.key, { distance: label.distance }) }}
    </span>
</template>
