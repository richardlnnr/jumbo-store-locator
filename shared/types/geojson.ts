import type { Feature, FeatureCollection, Point } from 'geojson'
import type { JumboStore } from './store'

export type JumboStoreFeature = Feature<Point, JumboStore>

export type JumboStoreFeatureCollection = FeatureCollection<Point, JumboStore>
