import type { JumboStore } from '../../shared/types/store'
import type { JumboStoreFeature, JumboStoreFeatureCollection } from '../../shared/types/geojson'
import { formatCityName } from '../../shared/utils/cityName/cityName'
import { isInNetherlands } from '../../shared/utils/isInNetherlands/isInNetherlands'

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
    features: stores
        .filter(store => isInNetherlands(store.location))
        .map(toFeature),
})
