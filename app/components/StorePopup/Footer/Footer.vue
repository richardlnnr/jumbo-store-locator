<script setup lang="ts">
import { computed } from 'vue'

const GOOGLE_MAPS_SEARCH_BASE = 'https://www.google.com/maps/search/?api=1&query='

const props = defineProps<{
    storeName: string
}>()

const { t } = useI18n()

const googleMapsUrl = computed(() =>
    `${GOOGLE_MAPS_SEARCH_BASE}${encodeURIComponent(props.storeName)}`,
)
</script>

<template>
    <footer class="flex shrink-0 flex-col border-t border-neutral-100 bg-neutral-50 px-5 pt-4 pb-5">
        <UButton
            :to="googleMapsUrl"
            target="_blank"
            rel="noopener noreferrer"
            color="neutral"
            variant="solid"
            size="lg"
            block
            icon="i-lucide-map-pin"
            :ui="{
                base: 'rounded-full bg-yellow-500 text-neutral-950 hover:bg-yellow-200 py-4 ring-0 font-black gap-3',
                leadingIcon: 'size-4.5',
            }"
        >
            {{ t('store-popup.open-in-google-maps') }}
        </UButton>
    </footer>
</template>
