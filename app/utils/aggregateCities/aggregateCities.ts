import type { JumboStoreFeature } from '../../../shared/types/geojson'

export interface CityAggregate {
    city: string
    state: string
}

export const aggregateCities = (features: JumboStoreFeature[]): CityAggregate[] => {
    const seen = new Map<string, CityAggregate>()
    for (const feature of features) {
        const { city, state } = feature.properties.location.address
        const key = city.toLowerCase()
        if (seen.has(key)) continue
        seen.set(key, { city, state })
    }
    return [...seen.values()]
}
