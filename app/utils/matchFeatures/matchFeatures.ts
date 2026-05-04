import type { JumboStoreFeature } from '../../../shared/types/geojson'

export const matchFeatures = (
    features: JumboStoreFeature[],
    query: string,
): JumboStoreFeature[] => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return features

    return features.filter((feature) => {
        const name = feature.properties.name.toLowerCase()
        const city = feature.properties.location.address.city.toLowerCase()
        return name.includes(normalizedQuery) || city.includes(normalizedQuery)
    })
}
