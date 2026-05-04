import type { CityAggregate } from '../aggregateCities/aggregateCities'
import { scoreText } from '../scoreText/scoreText'

export const rankCities = (
    aggregates: CityAggregate[],
    query: string,
): CityAggregate[] => {
    if (!query.trim()) return aggregates

    return aggregates
        .map((aggregate, index) => ({
            aggregate,
            index,
            score: scoreText(aggregate.city, query),
        }))
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .map(entry => entry.aggregate)
}
