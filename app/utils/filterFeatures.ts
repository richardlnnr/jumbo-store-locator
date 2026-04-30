import type { JumboStoreFeature } from '../../shared/types/geojson'
import type { Coordinate } from '../../shared/types/store'
import { distanceKm } from './distance'
import { getStoreStatus } from './storeStatus'

export interface FilterFeaturesInput {
    features: JumboStoreFeature[]
    query: string
    cityFilter: string[]
    openOnly: boolean
    now: Date | null
    userLocation: Coordinate | null
}

const matchesQuery = (feature: JumboStoreFeature, normalizedQuery: string): boolean => {
    if (!normalizedQuery) return true
    const name = feature.properties.name.toLowerCase()
    const city = feature.properties.location.address.city.toLowerCase()
    return name.includes(normalizedQuery) || city.includes(normalizedQuery)
}

const matchesCity = (feature: JumboStoreFeature, allowedCities: Set<string>): boolean => {
    if (allowedCities.size === 0) return true
    return allowedCities.has(feature.properties.location.address.city.toLowerCase())
}

const isOpenNow = (feature: JumboStoreFeature, now: Date | null): boolean => {
    if (!now) return false
    return getStoreStatus(feature.properties, now).isOpen
}

export function filterFeatures(input: FilterFeaturesInput): JumboStoreFeature[] {
    const normalizedQuery = input.query.trim().toLowerCase()
    const allowedCities = new Set(
        input.cityFilter.map(city => city.trim().toLowerCase()).filter(city => city.length > 0),
    )

    const matched = input.features.filter(feature =>
        matchesQuery(feature, normalizedQuery)
        && matchesCity(feature, allowedCities)
        && (!input.openOnly || isOpenNow(feature, input.now)),
    )

    const userLocation = input.userLocation
    if (userLocation) {
        return matched.sort((featureA, featureB) =>
            distanceKm(userLocation, featureA.properties.location)
            - distanceKm(userLocation, featureB.properties.location),
        )
    }

    return matched.sort((featureA, featureB) =>
        featureA.properties.name.localeCompare(featureB.properties.name),
    )
}
