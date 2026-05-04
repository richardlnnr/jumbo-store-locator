<script setup lang="ts">
const { t } = useI18n()
const store = useStoreLocator()
const { mobileView } = storeToRefs(store)

const otherView = computed<'list' | 'map'>(() => (mobileView.value === 'list' ? 'map' : 'list'))

const label = computed(() =>
    mobileView.value === 'list'
        ? t('view-toggle.show-map')
        : t('view-toggle.show-list'),
)

const icon = computed(() => (mobileView.value === 'list' ? 'i-lucide-map' : 'i-lucide-list'))

const onClick = (): void => {
    store.setMobileView(otherView.value)
}
</script>

<template>
    <UButton
        data-component="mobile-switch-view"
        :icon="icon"
        :ui="{
            base: 'absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900 px-5 py-3 font-bold text-yellow-500 shadow-lg hover:bg-neutral-900 md:hidden',
        }"
        @click="onClick"
    >
        {{ label }}
    </UButton>
</template>
