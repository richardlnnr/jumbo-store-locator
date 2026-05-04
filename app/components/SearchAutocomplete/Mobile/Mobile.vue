<script setup lang="ts">
import type { SuggestionItem } from '~~/shared/types/storeSuggestion'

const { t } = useI18n()
const store = useStoreLocator()
const suggestionItems = useSuggestionItems()

const open = ref(false)
let justApplied = false

const triggerLabel = computed(() => store.query.trim() || t('search-autocomplete.placeholder'))
const triggerIsPlaceholder = computed(() => store.query.trim().length === 0)

const searchTermProxy = computed<string>({
    get: () => store.searchTerm,
    set: (value) => {
        store.setSearchTerm(value)
    },
})

const openModal = (): void => {
    store.setSearchTerm(store.query)
    open.value = true
}

const closeModal = (): void => {
    open.value = false
}

const onClear = (): void => {
    store.setSearchTerm('')
    store.applySearchTerm()
}

const commitSearch = (override?: string): void => {
    if (override !== undefined) store.setSearchTerm(override)
    justApplied = true
    store.applySearchTerm()
    open.value = false
    requestAnimationFrame(() => {
        justApplied = false
    })
}

const isSelectableItem = (item: SuggestionItem): item is Extract<SuggestionItem, { kind: 'store' | 'city' }> =>
    item.kind === 'store' || item.kind === 'city'

const onItemClick = (item: SuggestionItem): void => {
    if (item.kind === 'store') commitSearch(item.label)
    else if (item.kind === 'city') commitSearch(item.city.rawName)
}

const onEnter = (event: KeyboardEvent): void => {
    event.preventDefault()
    commitSearch()
}

watch(open, (isOpen) => {
    if (isOpen) return
    if (!justApplied) store.revertSearchTerm()
})

defineExpose({ open, openModal, closeModal })
</script>

<template>
    <div data-slot="autocomplete-mobile">
        <button
            type="button"
            data-slot="trigger"
            :aria-label="t('search-autocomplete.aria-trigger')"
            aria-haspopup="dialog"
            :aria-expanded="open"
            class="flex min-h-11 w-full items-center gap-3 rounded-full border-2 border-yellow-500 bg-white px-4 py-2.5 text-left"
            @click="openModal"
        >
            <UIcon
                name="i-lucide-search"
                class="size-5 shrink-0 text-neutral-500"
                aria-hidden="true"
            />
            <span
                class="min-w-0 flex-1 truncate text-base"
                :class="triggerIsPlaceholder ? 'text-neutral-500' : 'text-neutral-900'"
            >
                {{ triggerLabel }}
            </span>
        </button>

        <UModal
            v-model:open="open"
            fullscreen
            :ui="{ content: 'rounded-none', body: 'p-0' }"
        >
            <template #content>
                <div class="flex h-full flex-col bg-white">
                    <header class="flex items-center gap-3 border-b border-neutral-100 px-3 pt-3 pb-3.5">
                        <UButton
                            color="neutral"
                            variant="ghost"
                            icon="i-lucide-arrow-left"
                            size="lg"
                            :aria-label="t('search-autocomplete.aria-back')"
                            :ui="{ base: 'min-h-11 min-w-11' }"
                            @click="closeModal"
                        />
                        <UInput
                            v-model="searchTermProxy"
                            :placeholder="t('search-autocomplete.placeholder')"
                            icon="i-lucide-search"
                            size="lg"
                            autofocus
                            class="flex-1"
                            :ui="{
                                base: 'min-h-11 rounded-full border-2 border-yellow-500 bg-white ring-0 focus:ring-0',
                                leading: 'text-neutral-500',
                            }"
                            role="combobox"
                            aria-controls="search-autocomplete-mobile-listbox"
                            :aria-expanded="store.searchTerm.trim().length > 0"
                            aria-autocomplete="list"
                            @keydown.enter="onEnter"
                            @keydown.esc="closeModal"
                        >
                            <template #trailing>
                                <UButton
                                    v-if="store.searchTerm.length > 0"
                                    :aria-label="t('search-autocomplete.aria-clear')"
                                    icon="i-lucide-x"
                                    size="xs"
                                    color="neutral"
                                    variant="ghost"
                                    @click="onClear"
                                />
                            </template>
                        </UInput>
                    </header>

                    <div
                        id="search-autocomplete-mobile-listbox"
                        role="listbox"
                        class="flex-1 overflow-y-auto"
                        :aria-label="t('app-shell.list-region')"
                    >
                        <SearchAutocompleteEmptyState
                            v-if="store.searchTerm.trim().length === 0"
                        />
                        <p
                            v-else-if="suggestionItems.length === 0"
                            class="px-4 py-8 text-center text-sm text-neutral-600"
                        >
                            {{ t('search-autocomplete.no-results', { query: store.searchTerm }) }}
                        </p>
                        <ul
                            v-else
                            class="flex flex-col"
                        >
                            <li
                                v-for="(item, index) in suggestionItems"
                                :key="`${item.kind}-${index}`"
                                :role="isSelectableItem(item) ? 'option' : 'presentation'"
                                :aria-selected="isSelectableItem(item) ? false : undefined"
                                :class="isSelectableItem(item) ? 'cursor-pointer' : ''"
                                @click="onItemClick(item)"
                            >
                                <SearchAutocompleteSuggestionItem
                                    :item="item"
                                    :query="store.searchTerm"
                                />
                            </li>
                        </ul>
                    </div>
                </div>
            </template>
        </UModal>
    </div>
</template>
