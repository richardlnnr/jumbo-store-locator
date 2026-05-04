<script setup lang="ts">
import { refDebounced } from '@vueuse/core'

const { t } = useI18n()
const store = useStoreLocator()

const announcement = computed(() => {
    const term = store.searchTerm.trim()
    if (term.length === 0) return ''
    const suggestions = store.autocompleteSuggestions
    if (suggestions.topStores.length === 0 && suggestions.topCities.length === 0) {
        return t('search-autocomplete.aria-no-results', { query: term })
    }
    return t('search-autocomplete.aria-results-count', {
        count: suggestions.topStores.length,
        cityCount: suggestions.topCities.length,
    })
})

const debouncedAnnouncement = refDebounced(announcement, 200)
</script>

<template>
    <div data-slot="search-autocomplete">
        <SearchAutocompleteDesktop class="hidden md:block" />
        <SearchAutocompleteMobile class="md:hidden" />
        <span
            class="sr-only"
            aria-live="polite"
            aria-atomic="true"
        >
            {{ debouncedAnnouncement }}
        </span>
    </div>
</template>
