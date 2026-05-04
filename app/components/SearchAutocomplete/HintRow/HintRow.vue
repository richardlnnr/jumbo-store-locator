<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
    <div
        data-slot="hint-row"
        class="flex items-center gap-3.5 border-t border-neutral-100 bg-neutral-50 px-4 py-2.5 text-xs text-neutral-600"
        aria-hidden="true"
    >
        <span class="flex items-center gap-1.5">
            <UKbd value="↑" />
            <UKbd value="↓" />
            {{ t('search-autocomplete.hint-navigate') }}
        </span>
        <span class="flex items-center gap-1.5">
            <UKbd value="↵" />
            {{ t('search-autocomplete.hint-select') }}
        </span>
        <span class="flex items-center gap-1.5">
            <UKbd value="ESC" />
            {{ t('search-autocomplete.hint-close') }}
        </span>
    </div>
</template>
