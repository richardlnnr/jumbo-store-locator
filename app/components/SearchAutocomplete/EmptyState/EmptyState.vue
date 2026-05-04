<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
    <div
        data-slot="empty-state"
        class="flex flex-col items-center justify-center gap-4 px-6 py-16"
    >
        <span
            class="flex size-14 items-center justify-center rounded-full bg-yellow-50"
            aria-hidden="true"
        >
            <UIcon
                name="i-lucide-search"
                class="size-7 text-yellow-700"
            />
        </span>
        <p
            data-slot="empty-title"
            class="text-base font-semibold text-neutral-900"
        >
            {{ t('search-autocomplete.empty-title') }}
        </p>
        <p
            data-slot="empty-hint"
            class="max-w-[300px] text-center text-sm text-neutral-500"
        >
            {{ t('search-autocomplete.empty-hint', { city: t('search-autocomplete.empty-example-city') }) }}
        </p>
    </div>
</template>
