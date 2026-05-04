import { computed } from 'vue'
import type { ComputedRef } from 'vue'

import type { SuggestionItem } from '../../../shared/types/storeSuggestion'
import {
    SUGGESTION_CITY_LIMIT,
    SUGGESTION_STORE_LIMIT,
    useStoreLocator,
} from '../../stores/useStoreLocator'

export const useSuggestionItems = (): ComputedRef<SuggestionItem[]> => {
    const store = useStoreLocator()
    const { t } = useI18n()

    return computed<SuggestionItem[]>(() => {
        const suggestions = store.autocompleteSuggestions
        const items: SuggestionItem[] = []

        if (suggestions.topStores.length) {
            items.push({
                kind: 'label',
                label: t('search-autocomplete.group-stores'),
                disabled: true,
            })
            for (const feature of suggestions.topStores) {
                items.push({ kind: 'store', label: feature.properties.name, feature })
            }
            if (suggestions.isStoresCapped) {
                items.push({
                    kind: 'cap',
                    label: t('search-autocomplete.cap-notice', { count: SUGGESTION_STORE_LIMIT }),
                    count: SUGGESTION_STORE_LIMIT,
                    disabled: true,
                })
            }
        }

        if (suggestions.topCities.length) {
            items.push({
                kind: 'label',
                label: t('search-autocomplete.group-cities'),
                disabled: true,
            })
            for (const city of suggestions.topCities) {
                items.push({ kind: 'city', label: city.rawName, city })
            }
            if (suggestions.isCitiesCapped) {
                items.push({
                    kind: 'cap',
                    label: t('search-autocomplete.cap-notice', { count: SUGGESTION_CITY_LIMIT }),
                    count: SUGGESTION_CITY_LIMIT,
                    disabled: true,
                })
            }
        }

        return items
    })
}
