<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
    <aside
        role="region"
        class="flex items-center justify-center p-6 text-sm text-neutral-600"
    >
        {{ t('store-list.placeholder') }}
    </aside>
</template>
