import type { JumboStore } from '../../shared/types/store'
import type { JumboStoreFeature, JumboStoreFeatureCollection } from '../../shared/types/geojson'

const toFeature = (store: JumboStore): JumboStoreFeature => ({
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [store.location.longitude, store.location.latitude],
    },
    properties: store,
})

export const storesToGeoJson = (stores: JumboStore[]): JumboStoreFeatureCollection => ({
    type: 'FeatureCollection',
    features: stores.map(toFeature),
})
