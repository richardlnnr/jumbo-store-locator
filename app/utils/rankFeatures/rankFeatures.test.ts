import { describe, expect, it } from 'vitest'

import type { JumboStoreFeature } from '../../../shared/types/geojson'
import {
    amsterdamCentrumFeature,
    amsterdamSouthFeature,
    buildFeature,
    buildStore,
    everyDay,
    hours,
} from '../../../shared/types/store.mock'
import { rankFeatures } from './rankFeatures'

const buildFeatureWithCity = (storeId: string, name: string, city: string): JumboStoreFeature =>
    buildFeature(buildStore(everyDay(hours('08:00', '22:00')), {
        storeId,
        name,
        location: {
            latitude: 52,
            longitude: 5,
            address: {
                street: 'Test',
                houseNumber: '1',
                postalCode: '0000AA',
                city,
                state: 'Province',
                countryCode: 'NL',
            },
        },
    }))

describe('rankFeatures', () => {
    it('Should return features as-is when the query is empty', () => {
        const features = [amsterdamCentrumFeature, amsterdamSouthFeature]

        expect(rankFeatures(features, '')).toEqual(features)
    })

    it('Should rank prefix matches above contains-only matches', () => {
        const helmondStore = buildFeatureWithCity('h-1', 'Jumbo Helmond Centrum', 'Helmond')
        const groningenStore = buildFeatureWithCity('g-1', 'Jumbo Groningen Helmertspark', 'Groningen')
        const ranked = rankFeatures([groningenStore, helmondStore], 'Helm')

        expect(ranked[0]?.properties.storeId).toBe('h-1')
        expect(ranked[1]?.properties.storeId).toBe('g-1')
    })

    it('Should rank by the best of name-score and city-score', () => {
        const cityPrefix = buildFeatureWithCity('c-1', 'Jumbo Centrum Filiaal', 'Helmond')
        const namePrefix = buildFeatureWithCity('n-1', 'Helm Jumbo Filiaal', 'Eindhoven')
        const ranked = rankFeatures([cityPrefix, namePrefix], 'Helm')

        expect(ranked[0]?.properties.storeId === 'c-1' || ranked[0]?.properties.storeId === 'n-1').toBe(true)
        expect(ranked[1]?.properties.storeId === 'c-1' || ranked[1]?.properties.storeId === 'n-1').toBe(true)
    })

    it('Should preserve input order between features that tie on score', () => {
        const a = buildFeatureWithCity('a', 'Jumbo Helmond Eerste', 'Helmond')
        const b = buildFeatureWithCity('b', 'Jumbo Helmond Tweede', 'Helmond')
        const c = buildFeatureWithCity('c', 'Jumbo Helmond Derde', 'Helmond')
        const ranked = rankFeatures([a, b, c], 'Helm')

        expect(ranked.map(feature => feature.properties.storeId)).toEqual(['a', 'b', 'c'])
    })

    it('Should put no-match features last (when present in input)', () => {
        const matching = buildFeatureWithCity('m-1', 'Jumbo Helmond Centrum', 'Helmond')
        const nonMatching = buildFeatureWithCity('n-1', 'Jumbo Amsterdam Centrum', 'Amsterdam')
        const ranked = rankFeatures([nonMatching, matching], 'Helm')

        expect(ranked[0]?.properties.storeId).toBe('m-1')
        expect(ranked[1]?.properties.storeId).toBe('n-1')
    })
})
