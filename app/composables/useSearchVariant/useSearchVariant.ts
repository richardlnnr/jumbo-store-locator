import type { ComputedRef } from 'vue'

export type SearchVariant = 'autocomplete' | 'legacy'

export const useSearchVariant = (): ComputedRef<SearchVariant> => {
    const route = useRoute()
    return computed<SearchVariant>(() =>
        route.query.search === 'legacy' ? 'legacy' : 'autocomplete',
    )
}
