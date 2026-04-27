import type { JumboStore } from '../../shared/types/store'
import type { JumboStoreFeatureCollection } from '../../shared/types/geojson'

export function storesToGeoJson(_stores: JumboStore[]): JumboStoreFeatureCollection {
    return {
        type: 'FeatureCollection',
        features: [],
    }
}
