<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

const { t } = useI18n()
const store = useStoreLocator()
const isDesktop = useMediaQuery('(min-width: 768px)', { ssrWidth: 1280 })

const distanceLabelFor = useStoreDistanceLabel()
const searchVariant = useSearchVariant()

const inactiveChipClass = 'bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-50'
const activeChipClass = 'bg-yellow-200 border border-yellow-200 text-neutral-900 hover:bg-yellow-200'

const openNowChipClass = computed(() => [
    'rounded-full font-semibold',
    store.openOnly ? activeChipClass : inactiveChipClass,
])

const cityChipClass = computed(() => [
    'rounded-full font-semibold gap-2',
    store.cityFilter.length ? activeChipClass : inactiveChipClass,
])

function clearCities(): void {
    store.setCityFilter([])
}

const onRowSelect = (id: string): void => {
    if (isDesktop.value) {
        store.selectStore(id)
        return
    }
    store.queuePendingSelection(id)
}
</script>

<template>
    <aside
        role="region"
        class="store-list flex h-full flex-col bg-white"
    >
        <header class="flex flex-col gap-4 border-b border-neutral-100 px-6 pt-6 pb-4">
            <div class="flex flex-col gap-1">
                <h1 class="text-2xl font-black tracking-tight text-neutral-900">
                    {{ t('store-list.title') }}
                </h1>
                <p class="text-[13px] text-neutral-600">
                    {{ t('store-list.count', { count: store.filteredFeatureCollection.features.length }) }}
                </p>
            </div>

            <SearchAutocomplete v-if="searchVariant === 'autocomplete'" />
            <Search v-else />

            <div class="flex flex-wrap gap-2">
                <UButton
                    color="neutral"
                    variant="solid"
                    size="sm"
                    :ui="{ base: openNowChipClass }"
                    @click="store.setOpenOnly(!store.openOnly)"
                >
                    <span
                        class="size-2 shrink-0 rounded-full bg-green-500"
                    />
                    {{ t('filters.open-now') }}
                </UButton>

                <USelectMenu
                    :model-value="store.cityFilter"
                    :items="store.cities"
                    multiple
                    color="neutral"
                    variant="none"
                    size="sm"
                    :search-input="{
                        placeholder: t('filters.search-city'),
                        size: 'md',
                    }"
                    :ui="{
                        base: cityChipClass,
                        content: 'w-80 bg-white border border-neutral-200 shadow-lg ring-0',
                        viewport: 'scrollbar-thin-neutral',
                        item: 'data-highlighted:bg-neutral-50 data-[state=checked]:bg-neutral-50 rounded-lg px-2.5 py-2 gap-2.5 text-neutral-900',
                        itemLabel: 'text-[13px] text-neutral-900 data-[state=checked]:font-semibold',
                        itemLeadingIcon: 'text-yellow-500',
                    }"
                    @update:model-value="store.setCityFilter"
                >
                    <template #default>
                        <span>{{ t('filters.cities') }}</span>
                        <span
                            v-if="store.cityFilter.length"
                            data-slot="city-count"
                            class="rounded-full bg-yellow-500 px-1.5 text-[11px] font-bold text-neutral-900"
                        >
                            {{ store.cityFilter.length }}
                        </span>
                    </template>

                    <template #content-bottom>
                        <div
                            v-if="store.cityFilter.length"
                            class="flex items-center justify-between border-t border-neutral-100 px-3.5 py-2.5"
                        >
                            <span class="text-xs font-medium text-neutral-600">
                                {{ t('filters.cities-selected', { count: store.cityFilter.length }) }}
                            </span>
                            <UButton
                                color="neutral"
                                variant="link"
                                size="xs"
                                :ui="{ base: 'p-0 text-xs font-semibold text-neutral-900' }"
                                @click="clearCities"
                            >
                                {{ t('filters.clear') }}
                            </UButton>
                        </div>
                    </template>
                </USelectMenu>
            </div>
        </header>

        <ul
            v-if="store.filteredFeatureCollection.features.length"
            class="scrollbar-thin-neutral flex-1 overflow-y-auto"
        >
            <li
                v-for="feature in store.filteredFeatureCollection.features"
                :key="feature.properties.storeId"
            >
                <StoreListItem
                    :store="feature.properties"
                    :distance-label="distanceLabelFor(feature)"
                    :selected="store.selectedStoreId === feature.properties.storeId"
                    @select="onRowSelect(feature.properties.storeId)"
                />
            </li>
        </ul>
        <p
            v-else
            class="px-6 py-8 text-center text-sm text-neutral-600"
        >
            {{ t('store-list.empty') }}
        </p>
    </aside>
</template>
