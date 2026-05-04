<script setup lang="ts">
const { t } = useI18n()
const store = useStoreLocator()
</script>

<template>
    <UInput
        :model-value="store.query"
        :placeholder="t('store-list.search-placeholder')"
        icon="i-lucide-search"
        size="lg"
        :ui="{ base: 'rounded-xl bg-neutral-100 ring-neutral-200' }"
        @update:model-value="store.setQuery"
    />
</template>
