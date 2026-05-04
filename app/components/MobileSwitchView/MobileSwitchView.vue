<script setup lang="ts">
import type { MobileView } from '~~/shared/types/mobileView'

const { t } = useI18n()
const store = useStoreLocator()
const { mobileView } = storeToRefs(store)

const otherView = computed<MobileView>(() => (mobileView.value === 'list' ? 'map' : 'list'))

const label = computed(() =>
    mobileView.value === 'list'
        ? t('view-toggle.show-map')
        : t('view-toggle.show-list'),
)

const icon = computed(() => (mobileView.value === 'list' ? 'i-lucide-map' : 'i-lucide-list'))

const liveAnnouncement = computed(() =>
    mobileView.value === 'list'
        ? t('view-toggle.now-showing-list')
        : t('view-toggle.now-showing-map'),
)

const onClick = (): void => {
    store.setMobileView(otherView.value)
}
</script>

<template>
    <div class="contents">
        <UButton
            data-component="mobile-switch-view"
            :icon="icon"
            :ui="{
                base: 'absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900 px-5 py-3 font-bold text-yellow-500 shadow-lg hover:bg-neutral-900 md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500',
            }"
            @click="onClick"
        >
            {{ label }}
        </UButton>
        <output
            data-slot="view-toggle-live-region"
            class="sr-only"
            aria-live="polite"
        >
            {{ liveAnnouncement }}
        </output>
    </div>
</template>
