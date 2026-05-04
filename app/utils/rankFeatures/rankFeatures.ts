import type { JumboStoreFeature } from '../../../shared/types/geojson'
import { scoreText } from '../scoreText/scoreText'

const featureScore = (feature: JumboStoreFeature, query: string): number => {
    const nameScore = scoreText(feature.properties.name, query)
    const cityScore = scoreText(feature.properties.location.address.city, query)
    return Math.max(nameScore, cityScore)
}

export const rankFeatures = (
    features: JumboStoreFeature[],
    query: string,
): JumboStoreFeature[] => {
    if (!query.trim()) return features

    return features
        .map((feature, index) => ({ feature, index, score: featureScore(feature, query) }))
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .map(entry => entry.feature)
}
