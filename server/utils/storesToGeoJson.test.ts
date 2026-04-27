import { describe, expect, it } from 'vitest'

import { storesToGeoJson } from './storesToGeoJson'
import { supermarketFixture, virtualFixture } from './storesToGeoJson.mock'

describe('storesToGeoJson', () => {
    it('Should return a FeatureCollection with one Feature per store', () => {
        const result = storesToGeoJson([supermarketFixture, virtualFixture])

        expect(result.type).toBe('FeatureCollection')
        expect(result.features).toHaveLength(2)
        expect(result.features.every(feature => feature.type === 'Feature')).toBe(true)
    })

    it('Should map each store into a Point feature with [longitude, latitude] coordinate order', () => {
        const result = storesToGeoJson([supermarketFixture])

        const feature = result.features[0]!
        expect(feature.geometry.type).toBe('Point')
        expect(feature.geometry.coordinates).toEqual([
            supermarketFixture.location.longitude,
            supermarketFixture.location.latitude,
        ])
    })

    it('Should copy storeId, name, complexNumber, websiteURL, facilities, commerce, address and openingHours into properties', () => {
        const result = storesToGeoJson([supermarketFixture])

        const feature = result.features[0]!
        expect(feature.properties).toEqual({
            storeId: supermarketFixture.storeId,
            name: supermarketFixture.name,
            complexNumber: supermarketFixture.complexNumber,
            websiteURL: supermarketFixture.websiteURL,
            facilities: supermarketFixture.facilities,
            commerce: supermarketFixture.commerce,
            address: supermarketFixture.location.address,
            openingHours: supermarketFixture.openingHours,
        })
    })

    it('Should not include latitude or longitude inside properties', () => {
        const result = storesToGeoJson([supermarketFixture])

        const feature = result.features[0]!
        expect(feature.properties).not.toHaveProperty('latitude')
        expect(feature.properties).not.toHaveProperty('longitude')
    })

    it('Should return an empty FeatureCollection when given an empty array', () => {
        const result = storesToGeoJson([])

        expect(result.type).toBe('FeatureCollection')
        expect(result.features).toEqual([])
    })
})
