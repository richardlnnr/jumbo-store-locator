<script setup lang="ts">
import { refDebounced, useMediaQuery } from '@vueuse/core'

const { t } = useI18n()
const store = useStoreLocator()

const isDesktopViewport = useMediaQuery('(min-width: 768px)')

watch(isDesktopViewport, () => {
    store.revertSearchTerm()
})

const announcement = computed(() => {
    const term = store.searchTerm.trim()
    if (term.length === 0) return ''
    const suggestions = store.autocompleteSuggestions
    if (suggestions.topStores.length === 0 && suggestions.topCities.length === 0) {
        return t('search-autocomplete.aria-no-results', { query: term })
    }
    const stores = t('search-autocomplete.aria-results-stores', { count: suggestions.topStores.length })
    const cities = t('search-autocomplete.aria-results-cities', { count: suggestions.topCities.length })
    return t('search-autocomplete.aria-results-count', { stores, cities, query: term })
})

const debouncedAnnouncement = refDebounced(announcement, 600)
</script>

<template>
    <div data-slot="search-autocomplete">
        <SearchAutocompleteDesktop class="hidden md:block" />
        <SearchAutocompleteMobile class="md:hidden" />
        <output
            class="sr-only"
            aria-live="polite"
            aria-atomic="true"
        >
            {{ debouncedAnnouncement }}
        </output>
    </div>
</template>
