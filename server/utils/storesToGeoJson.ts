import type { JumboStore } from '../../shared/types/store'
import type { JumboStoreFeature, JumboStoreFeatureCollection } from '../../shared/types/geojson'
import { formatCityName } from '../../shared/utils/cityName'

const toFeature = (store: JumboStore): JumboStoreFeature => ({
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [store.location.longitude, store.location.latitude],
    },
    properties: {
        ...store,
        location: {
            ...store.location,
            address: {
                ...store.location.address,
                city: formatCityName(store.location.address.city),
            },
        },
    },
})

export const storesToGeoJson = (stores: JumboStore[]): JumboStoreFeatureCollection => ({
    type: 'FeatureCollection',
    features: stores.map(toFeature),
})
