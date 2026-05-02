import bbox from '@turf/bbox'
import type { LngLatBoundsLike } from 'mapbox-gl'

import type { JumboStoreFeatureCollection } from '../../../shared/types/geojson'

const NETHERLANDS_BOUNDS: LngLatBoundsLike = [
    [3.31, 50.75],
    [7.23, 53.55],
]

export const computeStoresBounds = (
    collection: JumboStoreFeatureCollection,
): LngLatBoundsLike => {
    if (collection.features.length === 0) return NETHERLANDS_BOUNDS

    const [west, south, east, north] = bbox(collection)
    return [[west, south], [east, north]]
}
