import { describe, expect, it } from 'vitest'

import type { JumboStoreFeature } from '../../../shared/types/geojson'
import {
    buildFeature,
    buildStore,
    everyDay,
    hours,
} from '../../../shared/types/store.mock'
import { aggregateCities } from './aggregateCities'

const featureIn = (storeId: string, city: string, state: string): JumboStoreFeature =>
    buildFeature(buildStore(everyDay(hours('08:00', '22:00')), {
        storeId,
        name: `Jumbo ${city}`,
        location: {
            latitude: 52,
            longitude: 5,
            address: {
                street: 'Test',
                houseNumber: '1',
                postalCode: '0000AA',
                city,
                state,
                countryCode: 'NL',
            },
        },
    }))

describe('aggregateCities', () => {
    it('Should return an empty array when there are no features', () => {
        expect(aggregateCities([])).toEqual([])
    })

    it('Should deduplicate cities by lower-cased name', () => {
        const aggregates = aggregateCities([
            featureIn('1', 'Amsterdam', 'Noord-Holland'),
            featureIn('2', 'AMSTERDAM', 'Noord-Holland'),
            featureIn('3', 'amsterdam', 'Noord-Holland'),
        ])

        expect(aggregates).toHaveLength(1)
        expect(aggregates[0]?.city).toBe('Amsterdam')
    })

    it('Should preserve the first-seen state when duplicates disagree', () => {
        const aggregates = aggregateCities([
            featureIn('1', 'Amsterdam', 'Noord-Holland'),
            featureIn('2', 'Amsterdam', 'Different-Province'),
        ])

        expect(aggregates[0]?.state).toBe('Noord-Holland')
    })

    it('Should preserve the order in which cities were first seen', () => {
        const aggregates = aggregateCities([
            featureIn('1', 'Amsterdam', 'Noord-Holland'),
            featureIn('2', 'Eindhoven', 'Noord-Brabant'),
            featureIn('3', 'Amsterdam', 'Noord-Holland'),
            featureIn('4', 'Helmond', 'Noord-Brabant'),
        ])

        expect(aggregates.map(aggregate => aggregate.city)).toEqual(['Amsterdam', 'Eindhoven', 'Helmond'])
    })

    it('Should keep the original casing of the first-seen city', () => {
        const aggregates = aggregateCities([featureIn('1', 'AMSTERDAM', 'Noord-Holland')])

        expect(aggregates[0]?.city).toBe('AMSTERDAM')
    })
})
