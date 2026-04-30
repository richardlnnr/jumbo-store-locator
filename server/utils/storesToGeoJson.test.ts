import { describe, expect, it } from 'vitest'

import { storesToGeoJson } from './storesToGeoJson'
import type { JumboStore } from '../../shared/types/store'
import { supermarketFixture, virtualFixture } from '../../shared/types/store.mock'

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

    it('Should expose the full JumboStore as the feature properties', () => {
        const result = storesToGeoJson([supermarketFixture])

        const feature = result.features[0]!
        expect(feature.properties).toEqual(supermarketFixture)
    })

    it('Should return an empty FeatureCollection when given an empty array', () => {
        const result = storesToGeoJson([])

        expect(result.type).toBe('FeatureCollection')
        expect(result.features).toEqual([])
    })

    it('Should title-case the upstream address.city so consumers receive a display-ready value', () => {
        const rawAllCaps: JumboStore = {
            ...supermarketFixture,
            location: {
                ...supermarketFixture.location,
                address: { ...supermarketFixture.location.address, city: 'AALSMEER' },
            },
        }

        const result = storesToGeoJson([rawAllCaps])

        expect(result.features[0]!.properties.location.address.city).toBe('Aalsmeer')
    })

    it('Should drop stores whose coordinates are placeholder zeros', () => {
        const placeholder: JumboStore = {
            ...supermarketFixture,
            storeId: 'placeholder',
            location: {
                ...supermarketFixture.location,
                latitude: 0,
                longitude: 0,
            },
        }

        const result = storesToGeoJson([supermarketFixture, placeholder])

        expect(result.features).toHaveLength(1)
        expect(result.features[0]!.properties.storeId).toBe(supermarketFixture.storeId)
    })

    it('Should drop stores whose latitude and longitude appear transposed', () => {
        const transposed: JumboStore = {
            ...supermarketFixture,
            storeId: 'transposed',
            location: {
                ...supermarketFixture.location,
                latitude: 4.762433,
                longitude: 52.264417,
            },
        }

        const result = storesToGeoJson([supermarketFixture, transposed])

        expect(result.features).toHaveLength(1)
        expect(result.features[0]!.properties.storeId).toBe(supermarketFixture.storeId)
    })

    it('Should drop stores whose coordinates fall outside the Netherlands bounding box', () => {
        const overseas: JumboStore = {
            ...supermarketFixture,
            storeId: 'overseas',
            location: {
                ...supermarketFixture.location,
                latitude: 35.0,
                longitude: 4.5,
            },
        }

        const result = storesToGeoJson([supermarketFixture, overseas])

        expect(result.features).toHaveLength(1)
        expect(result.features[0]!.properties.storeId).toBe(supermarketFixture.storeId)
    })
})
