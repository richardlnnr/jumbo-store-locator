<script setup lang="ts">
defineProps<{ count: number }>()

const { t } = useI18n()
</script>

<template>
    <div
        data-slot="cap-notice"
        class="mx-3 mt-1.5 mb-1 flex items-start gap-2.5 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2.5"
    >
        <UIcon
            name="i-lucide-info"
            class="mt-0.5 size-4 shrink-0 text-yellow-900"
            aria-hidden="true"
        />
        <span class="text-[13px] leading-5 text-yellow-900">
            {{ t('search-autocomplete.cap-notice', { count }) }}
        </span>
    </div>
</template>
