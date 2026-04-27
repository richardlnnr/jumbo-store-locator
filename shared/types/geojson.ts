import type { Feature, FeatureCollection, Point } from 'geojson'
import type {
    JumboStore,
    StoreAddress,
    StoreCommerce,
    StoreFacilities,
    StoreOpeningHours,
} from './store'

export type JumboStoreProperties = {
    storeId: JumboStore['storeId']
    name: JumboStore['name']
    complexNumber: JumboStore['complexNumber']
    websiteURL: JumboStore['websiteURL']
    facilities: StoreFacilities
    commerce: StoreCommerce
    address: StoreAddress
    openingHours: StoreOpeningHours
}

export type JumboStoreFeature = Feature<Point, JumboStoreProperties>

export type JumboStoreFeatureCollection = FeatureCollection<Point, JumboStoreProperties>
