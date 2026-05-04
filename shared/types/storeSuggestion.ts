import type { JumboStoreFeature } from './geojson'

export interface CitySuggestion {
    name: string
    rawName: string
    state: string
    storesCount: number
}

export interface AutocompleteSuggestions {
    topStores: JumboStoreFeature[]
    isStoresCapped: boolean
    topCities: CitySuggestion[]
    isCitiesCapped: boolean
}

export interface SuggestionLabelItem {
    kind: 'label'
    label: string
    disabled: true
}

export interface SuggestionStoreItem {
    kind: 'store'
    label: string
    feature: JumboStoreFeature
}

export interface SuggestionCityItem {
    kind: 'city'
    label: string
    city: CitySuggestion
}

export interface SuggestionCapItem {
    kind: 'cap'
    label: string
    count: number
    disabled: true
}

export type SuggestionItem
    = | SuggestionLabelItem
        | SuggestionStoreItem
        | SuggestionCityItem
        | SuggestionCapItem
