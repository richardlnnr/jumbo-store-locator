<script setup lang="ts">
import type { SuggestionItem } from '~~/shared/types/storeSuggestion'

defineProps<{
    item: SuggestionItem
    query: string
}>()

const distanceLabelFor = useStoreDistanceLabel()
</script>

<template>
    <h3
        v-if="item.kind === 'label'"
        data-slot="suggestion-section-label"
        class="px-4 pt-3 pb-2 text-xs font-semibold tracking-[0.06em] text-neutral-700 uppercase"
    >
        {{ item.label }}
    </h3>
    <SearchAutocompleteRow
        v-else-if="item.kind === 'store'"
        variant="store"
        :feature="item.feature"
        :distance-label="distanceLabelFor(item.feature)"
        :query="query"
        class="w-full"
    />
    <SearchAutocompleteRow
        v-else-if="item.kind === 'city'"
        variant="city"
        :city="item.city"
        :query="query"
        class="w-full"
    />
    <SearchAutocompleteCapNotice
        v-else-if="item.kind === 'cap'"
        :count="item.count"
    />
</template>
