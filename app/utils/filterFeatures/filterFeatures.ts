import type { JumboStoreFeature } from '../../../shared/types/geojson'
import type { Coordinate } from '../../../shared/types/store'
import { distanceKm } from '../distance/distance'
import { matchFeatures } from '../matchFeatures/matchFeatures'
import { getStoreStatus } from '../storeStatus/storeStatus'

export interface FilterFeaturesInput {
    features: JumboStoreFeature[]
    query: string
    cityFilter: string[]
    openOnly: boolean
    now: Date | null
    userLocation: Coordinate | null
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
    const allowedCities = new Set(
        input.cityFilter.map(city => city.trim().toLowerCase()).filter(city => city.length > 0),
    )

    const matched = matchFeatures(input.features, input.query).filter(feature =>
        matchesCity(feature, allowedCities)
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
