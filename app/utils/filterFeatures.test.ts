import { describe, expect, it } from 'vitest'

import {
    AMSTERDAM,
    amsterdamCentrumFeature,
    amsterdamNorthFeature,
    amsterdamSouthFeature,
    eindhovenFeature,
    sundayOnlyFeature,
} from '../../shared/types/store.mock'
import type { JumboStoreFeature } from '../../shared/types/geojson'
import { filterFeatures } from './filterFeatures'

const tuesdayMidday = new Date(2025, 0, 7, 14, 0, 0)
const tuesdayBeforeOpen = new Date(2025, 0, 7, 6, 0, 0)

const allFeatures: JumboStoreFeature[] = [
    amsterdamNorthFeature,
    eindhovenFeature,
    amsterdamCentrumFeature,
    amsterdamSouthFeature,
    sundayOnlyFeature,
]

const baseInput = {
    features: allFeatures,
    query: '',
    cityFilter: [] as string[],
    openOnly: false,
    now: tuesdayMidday,
    userLocation: null,
}

describe('filterFeatures', () => {
    it('Should return all features sorted alphabetically by name when no filters and no userLocation', () => {
        const result = filterFeatures(baseInput)

        expect(result.map(feature => feature.properties.name)).toEqual([
            'Jumbo Amsterdam Centrum',
            'Jumbo Amsterdam Noord',
            'Jumbo Amsterdam Zuid',
            'Jumbo Eindhoven Centrum',
            'Jumbo Sunday Only',
        ])
    })

    it('Should match query against feature name case-insensitively', () => {
        const result = filterFeatures({ ...baseInput, query: 'eindhoven' })

        expect(result.map(feature => feature.properties.storeId)).toEqual(['eindhoven-1'])
    })

    it('Should match query against feature city case-insensitively', () => {
        const result = filterFeatures({ ...baseInput, query: 'AMSTERDAM' })

        expect(result.map(feature => feature.properties.storeId).sort()).toEqual([
            'amsterdam-1',
            'amsterdam-2',
            'amsterdam-3',
        ])
    })

    it('Should treat query as a substring match, not just prefix', () => {
        const result = filterFeatures({ ...baseInput, query: 'centrum' })

        expect(result.map(feature => feature.properties.storeId).sort()).toEqual([
            'amsterdam-1',
            'eindhoven-1',
        ])
    })

    it('Should narrow to a single city via cityFilter case-insensitively', () => {
        const result = filterFeatures({ ...baseInput, cityFilter: ['amsterdam'] })

        expect(result.map(feature => feature.properties.storeId).sort()).toEqual([
            'amsterdam-1',
            'amsterdam-2',
            'amsterdam-3',
        ])
    })

    it('Should include features from any of the selected cities when cityFilter has multiple entries', () => {
        const result = filterFeatures({ ...baseInput, cityFilter: ['AMSTERDAM', 'EINDHOVEN'] })

        expect(result.map(feature => feature.properties.storeId).sort()).toEqual([
            'amsterdam-1',
            'amsterdam-2',
            'amsterdam-3',
            'eindhoven-1',
        ])
    })

    it('Should ignore empty or whitespace-only entries in cityFilter', () => {
        const result = filterFeatures({ ...baseInput, cityFilter: ['', '   ', 'AMSTERDAM'] })

        expect(result.map(feature => feature.properties.storeId).sort()).toEqual([
            'amsterdam-1',
            'amsterdam-2',
            'amsterdam-3',
        ])
    })

    it('Should treat an empty cityFilter array as no city filter', () => {
        const result = filterFeatures({ ...baseInput, cityFilter: [] })

        expect(result.length).toBe(allFeatures.length)
    })

    it('Should remove closed features when openOnly is true', () => {
        const result = filterFeatures({ ...baseInput, openOnly: true, now: tuesdayMidday })

        expect(result.map(feature => feature.properties.storeId)).not.toContain('sunday-only')
    })

    it('Should keep features that are open right now when openOnly is true', () => {
        const result = filterFeatures({ ...baseInput, openOnly: true, now: tuesdayMidday })

        expect(result.map(feature => feature.properties.storeId)).toContain('amsterdam-1')
    })

    it('Should remove features outside their opening window even when daily window exists', () => {
        const result = filterFeatures({ ...baseInput, openOnly: true, now: tuesdayBeforeOpen })

        expect(result.map(feature => feature.properties.storeId)).toEqual([])
    })

    it('Should AND query, cityFilter, and openOnly together', () => {
        const result = filterFeatures({
            ...baseInput,
            query: 'zuid',
            cityFilter: ['AMSTERDAM'],
            openOnly: true,
            now: tuesdayMidday,
        })

        expect(result.map(feature => feature.properties.storeId)).toEqual(['amsterdam-2'])
    })

    it('Should sort by ascending distance from userLocation when userLocation is set', () => {
        const result = filterFeatures({
            ...baseInput,
            cityFilter: ['AMSTERDAM'],
            userLocation: AMSTERDAM,
        })

        expect(result.map(feature => feature.properties.storeId)).toEqual([
            'amsterdam-1',
            'amsterdam-2',
            'amsterdam-3',
        ])
    })

    it('Should sort alphabetically by name when userLocation is null', () => {
        const result = filterFeatures({ ...baseInput, cityFilter: ['AMSTERDAM'] })

        expect(result.map(feature => feature.properties.name)).toEqual([
            'Jumbo Amsterdam Centrum',
            'Jumbo Amsterdam Noord',
            'Jumbo Amsterdam Zuid',
        ])
    })

    it('Should return an empty array when filters exclude all features', () => {
        const result = filterFeatures({ ...baseInput, query: 'no-such-store' })

        expect(result).toEqual([])
    })

    it('Should not mutate the input features array', () => {
        const originalOrder = allFeatures.map(feature => feature.properties.storeId)

        filterFeatures({ ...baseInput, userLocation: AMSTERDAM })

        expect(allFeatures.map(feature => feature.properties.storeId)).toEqual(originalOrder)
    })
})
