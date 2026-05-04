<script setup lang="ts">
definePageMeta({ colorMode: 'light' })

const { t } = useI18n()

const store = useStoreLocator()
const { mobileView } = storeToRefs(store)

await store.fetchStores()
</script>

<template>
    <main class="relative flex min-h-0 flex-1 flex-col md:flex-row">
        <StoreList
            :class="[
                'min-h-0 overflow-y-auto bg-white md:w-105 md:flex-none md:border-r md:border-neutral-200 md:flex',
                mobileView === 'list' ? 'flex-1' : 'hidden',
            ]"
            :aria-label="t('app-shell.list-region')"
        />
        <StoreMap
            :class="[
                'min-h-0 md:block md:flex-1',
                mobileView === 'map' ? 'flex-1' : 'hidden',
            ]"
            :aria-label="t('app-shell.map-region')"
        />
        <MobileSwitchView />
    </main>
</template>
