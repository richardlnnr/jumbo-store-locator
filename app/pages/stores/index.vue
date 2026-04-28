<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
    <main class="flex min-h-0 flex-1 flex-col md:flex-row">
        <StoreList
            class="min-h-0 flex-1 overflow-y-auto bg-white md:w-[420px] md:flex-none md:border-r md:border-neutral-200"
            :aria-label="t('app-shell.list-region')"
        />
        <StoreMap
            class="hidden min-h-0 flex-1 md:block"
            :aria-label="t('app-shell.map-region')"
        />
    </main>
</template>
