<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

import type { SuggestionItem } from '~~/shared/types/storeSuggestion'

const REVERT_SUPPRESSION_MS = 250

const { t } = useI18n()
const store = useStoreLocator()
const suggestionItems = useSuggestionItems()

const popoverOpen = ref(false)
const isDesktopViewport = useMediaQuery('(min-width: 768px)')
const rootRef = ref<HTMLElement | null>(null)
let suppressRevertUntil = 0

const syncInputDom = (value: string) => {
    const input = rootRef.value?.querySelector<HTMLInputElement>('input[role="combobox"]')
    if (!input) return
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    setter?.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
}

watch(() => store.searchTerm, (current, previous) => {
    if (!isDesktopViewport.value) return
    if (Date.now() < suppressRevertUntil) return
    if (current !== previous) popoverOpen.value = true
})

watch(isDesktopViewport, (isDesktop) => {
    if (!isDesktop) popoverOpen.value = false
})

const commitSearch = () => {
    suppressRevertUntil = Date.now() + REVERT_SUPPRESSION_MS
    store.applySearchTerm()
    popoverOpen.value = false
    requestAnimationFrame(() => {
        popoverOpen.value = false
    })
}

const userHasTyped = ref(false)

const onSearchTermUpdate = (value: string) => {
    if (!userHasTyped.value && value === '' && store.searchTerm !== '') return
    if (value === '' && Date.now() < suppressRevertUntil) return
    userHasTyped.value = true
    store.setSearchTerm(value)
}

const onOpenChange = (next: boolean) => {
    if (next && Date.now() < suppressRevertUntil) {
        popoverOpen.value = false
        return
    }
    if (next && !isDesktopViewport.value) {
        popoverOpen.value = false
        return
    }
    if (!next && popoverOpen.value && Date.now() >= suppressRevertUntil) {
        store.revertSearchTerm()
    }
    popoverOpen.value = next
}

const onModelValueUpdate = (value: unknown) => {
    if (!value || typeof value !== 'object') return
    const item = value as SuggestionItem
    if (item.kind !== 'store' && item.kind !== 'city') return
    const target = item.kind === 'store' ? item.label : item.city.rawName
    store.setSearchTerm(target)
    commitSearch()
}

const onEnter = (event: KeyboardEvent) => {
    event.preventDefault()
    commitSearch()
}

const onInputFocus = () => {
    if (Date.now() < suppressRevertUntil) return
    if (!isDesktopViewport.value) return
    popoverOpen.value = true
}

const restoreSelectionOnShiftHomeOrEnd = (event: KeyboardEvent) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement)) return
    if (event.key === 'Home') {
        const caret = target.selectionStart ?? target.selectionEnd ?? target.value.length
        target.setSelectionRange(0, caret, 'backward')
    }
    else if (event.key === 'End') {
        const caret = target.selectionStart ?? 0
        target.setSelectionRange(caret, target.value.length, 'forward')
    }
}

const onClear = () => {
    syncInputDom('')
    store.setSearchTerm('')
    suppressRevertUntil = Date.now() + REVERT_SUPPRESSION_MS
    store.applySearchTerm()
    popoverOpen.value = false
}

const inputBaseClass = computed(() => popoverOpen.value
    ? 'rounded-t-xl rounded-b-none ring-2 ring-yellow-500 focus:ring-yellow-500 bg-white'
    : 'rounded-xl ring-2 ring-yellow-500 focus:ring-yellow-500 bg-white',
)

const inputUi = computed(() => ({
    base: inputBaseClass.value,
    leading: 'text-neutral-500',
}))

const menuUi = {
    content: 'rounded-b-xl rounded-t-none border-2 border-t-0 border-yellow-500 bg-white shadow-[0_8px_24px_rgba(238,183,23,0.14)] max-h-[calc(100vh-180px)]',
    viewport: 'p-0',
    group: 'p-0 pb-1',
    item: 'rounded-none px-0 py-0 data-highlighted:bg-yellow-50 data-[state=checked]:bg-yellow-50 data-[disabled]:opacity-100 data-[disabled]:pointer-events-none',
    itemLabel: 'flex-1',
    empty: 'p-0',
}
</script>

<template>
    <div
        ref="rootRef"
        class="block w-full"
    >
        <UInputMenu
            :search-term="store.searchTerm"
            class="w-full"
            :items="suggestionItems"
            :open="popoverOpen"
            ignore-filter
            :placeholder="t('search-autocomplete.placeholder')"
            icon="i-lucide-search"
            size="lg"
            :ui="{ ...inputUi, ...menuUi }"
            :content="{ sideOffset: 0 }"
            @update:search-term="onSearchTermUpdate"
            @update:open="onOpenChange"
            @update:model-value="onModelValueUpdate"
            @keydown.enter="onEnter"
            @focusin="onInputFocus"
            @click="onInputFocus"
            @keyup.exact.shift.home="restoreSelectionOnShiftHomeOrEnd"
            @keyup.exact.shift.end="restoreSelectionOnShiftHomeOrEnd"
        >
            <template #trailing>
                <UButton
                    v-show="store.searchTerm.length > 0"
                    :aria-label="t('search-autocomplete.aria-clear')"
                    icon="i-lucide-x"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    @click.stop="onClear"
                    @mousedown.prevent
                />
            </template>
            <template #item="{ item }">
                <SearchAutocompleteSuggestionItem
                    :item="item as SuggestionItem"
                    :query="store.searchTerm"
                />
            </template>
            <template #empty>
                <SearchAutocompleteEmptyState
                    v-if="store.searchTerm.trim().length === 0"
                />
                <p
                    v-else
                    class="px-4 py-6 text-center text-sm text-neutral-600"
                >
                    {{ t('search-autocomplete.no-results', { query: store.searchTerm }) }}
                </p>
            </template>
            <template #content-bottom>
                <SearchAutocompleteHintRow v-if="store.searchTerm.trim().length > 0" />
            </template>
        </UInputMenu>
    </div>
</template>
