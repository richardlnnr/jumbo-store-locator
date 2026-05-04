import { describe, expect, it } from 'vitest'

import {
    amsterdamCentrumFeature,
    amsterdamSouthFeature,
    eindhovenFeature,
} from '../../../shared/types/store.mock'
import { matchFeatures } from './matchFeatures'

describe('matchFeatures', () => {
    const features = [eindhovenFeature, amsterdamCentrumFeature, amsterdamSouthFeature]

    it('Should return all features when the query is empty', () => {
        expect(matchFeatures(features, '')).toEqual(features)
    })

    it('Should return all features when the query is whitespace only', () => {
        expect(matchFeatures(features, '   ')).toEqual(features)
    })

    it('Should match features whose name contains the query case-insensitively', () => {
        const matched = matchFeatures(features, 'amsterdam')

        expect(matched.map(feature => feature.properties.storeId))
            .toEqual([amsterdamCentrumFeature.properties.storeId, amsterdamSouthFeature.properties.storeId])
    })

    it('Should match features whose city contains the query case-insensitively', () => {
        const matched = matchFeatures(features, 'EINDHOVEN')

        expect(matched).toHaveLength(1)
        expect(matched[0]?.properties.storeId).toBe(eindhovenFeature.properties.storeId)
    })

    it('Should preserve the original feature order in the matched output', () => {
        const matched = matchFeatures(features, 'jumbo')

        expect(matched).toEqual(features)
    })

    it('Should return an empty array when no feature matches', () => {
        expect(matchFeatures(features, 'rotterdam')).toEqual([])
    })
})
