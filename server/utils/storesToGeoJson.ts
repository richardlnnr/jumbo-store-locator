import type { JumboStore } from '../../shared/types/store'
import type { JumboStoreFeature, JumboStoreFeatureCollection } from '../../shared/types/geojson'

const toFeature = (store: JumboStore): JumboStoreFeature => {
    const { latitude, longitude, address } = store.location

    return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [longitude, latitude] },
        properties: {
            storeId: store.storeId,
            name: store.name,
            complexNumber: store.complexNumber,
            websiteURL: store.websiteURL,
            facilities: store.facilities,
            commerce: store.commerce,
            address,
            openingHours: store.openingHours,
        },
    }
}

export const storesToGeoJson = (stores: JumboStore[]): JumboStoreFeatureCollection => ({
    type: 'FeatureCollection',
    features: stores.map(toFeature),
})
