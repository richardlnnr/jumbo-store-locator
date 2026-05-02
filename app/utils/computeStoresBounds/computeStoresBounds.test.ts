import { describe, expect, it } from 'vitest'

import {
    amsterdamCentrumFeature,
    eindhovenFeature,
} from '../../../shared/types/store.mock'
import type { JumboStoreFeatureCollection } from '../../../shared/types/geojson'
import { computeStoresBounds } from './computeStoresBounds'

const emptyCollection: JumboStoreFeatureCollection = {
    type: 'FeatureCollection',
    features: [],
}

describe('computeStoresBounds', () => {
    it('Should return the Netherlands fallback bounds when the collection has no features', () => {
        const bounds = computeStoresBounds(emptyCollection)

        expect(bounds).toEqual([
            [3.31, 50.75],
            [7.23, 53.55],
        ])
    })

    it('Should return bounds spanning the supplied features', () => {
        const collection: JumboStoreFeatureCollection = {
            type: 'FeatureCollection',
            features: [eindhovenFeature, amsterdamCentrumFeature],
        }

        const bounds = computeStoresBounds(collection) as [[number, number], [number, number]]
        const [[west, south], [east, north]] = bounds

        const [eindhovenLng, eindhovenLat] = eindhovenFeature.geometry.coordinates as [number, number]
        const [amsterdamLng, amsterdamLat] = amsterdamCentrumFeature.geometry.coordinates as [number, number]

        expect(west).toBe(Math.min(eindhovenLng, amsterdamLng))
        expect(east).toBe(Math.max(eindhovenLng, amsterdamLng))
        expect(south).toBe(Math.min(eindhovenLat, amsterdamLat))
        expect(north).toBe(Math.max(eindhovenLat, amsterdamLat))
    })

    it('Should produce zero-area bounds at the feature coordinate when only one feature exists', () => {
        const collection: JumboStoreFeatureCollection = {
            type: 'FeatureCollection',
            features: [eindhovenFeature],
        }

        const bounds = computeStoresBounds(collection) as [[number, number], [number, number]]
        const [longitude, latitude] = eindhovenFeature.geometry.coordinates as [number, number]

        expect(bounds).toEqual([
            [longitude, latitude],
            [longitude, latitude],
        ])
    })
})
