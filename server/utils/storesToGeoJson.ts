import bboxPolygon from '@turf/bbox-polygon'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'

import type { JumboStore, StoreLocation } from '../../shared/types/store'
import type { JumboStoreFeature, JumboStoreFeatureCollection } from '../../shared/types/geojson'
import { formatCityName } from '../../shared/utils/cityName'

const NETHERLANDS_AREA = bboxPolygon([3, 50, 8, 54])

const isInNetherlands = (location: StoreLocation): boolean =>
    booleanPointInPolygon([location.longitude, location.latitude], NETHERLANDS_AREA)

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
