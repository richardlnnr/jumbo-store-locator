import { describe, expect, it } from 'vitest'

import enLocale from '../../i18n/locales/en.json'
import nlLocale from '../../i18n/locales/nl.json'

import {
    AMSTERDAM,
    NEARBY_AMSTERDAM_1_2KM,
    NEARBY_AMSTERDAM_500M,
    NEARBY_AMSTERDAM_990M,
    ROTTERDAM,
    SYDNEY,
} from './distance.mock'
import { getDistanceLabel } from './distance'

const TOLERANCE = 0.005

const within = (actual: number, expected: number): boolean =>
    Math.abs(actual - expected) / expected <= TOLERANCE

describe('getDistanceLabel', () => {
    it('Should return the m key with a meter value when distance is below 1 km', () => {
        const label = getDistanceLabel(AMSTERDAM, NEARBY_AMSTERDAM_500M)

        expect(label.key).toBe('distance.m')
        expect(label.distance).toBeGreaterThan(400)
        expect(label.distance).toBeLessThan(700)
    })

    it('Should round meter distances to a multiple of 50 m', () => {
        const label = getDistanceLabel(AMSTERDAM, NEARBY_AMSTERDAM_500M)

        expect(label.distance % 50).toBe(0)
    })

    it('Should return the km key with a one-decimal km value when distance is at least 1 km', () => {
        const label = getDistanceLabel(AMSTERDAM, ROTTERDAM)

        expect(label.key).toBe('distance.km')
        expect(label.distance).toBe(57.2)
    })

    it('Should switch from meters to kilometers around the 1 km boundary', () => {
        const labelBelow = getDistanceLabel(AMSTERDAM, NEARBY_AMSTERDAM_500M)
        const labelAbove = getDistanceLabel(AMSTERDAM, NEARBY_AMSTERDAM_1_2KM)

        expect(labelBelow.key).toBe('distance.m')
        expect(labelAbove.key).toBe('distance.km')
    })

    it('Should render as "1.0 km" rather than "1000 m" when the rounded meter value reaches 1000', () => {
        const label = getDistanceLabel(AMSTERDAM, NEARBY_AMSTERDAM_990M)

        expect(label.key).toBe('distance.km')
        expect(label.distance).toBe(1)
    })

    it('Should round km values to one decimal place', () => {
        const { distance } = getDistanceLabel(AMSTERDAM, ROTTERDAM)

        expect(Math.abs(distance * 10 - Math.round(distance * 10))).toBeLessThan(1e-9)
    })

    it('Should return 0 m for identical coordinates', () => {
        const label = getDistanceLabel(AMSTERDAM, AMSTERDAM)

        expect(label.key).toBe('distance.m')
        expect(label.distance).toBe(0)
    })

    it('Should be symmetric: getDistanceLabel(a, b) equals getDistanceLabel(b, a)', () => {
        const forward = getDistanceLabel(AMSTERDAM, ROTTERDAM)
        const reverse = getDistanceLabel(ROTTERDAM, AMSTERDAM)

        expect(reverse).toEqual(forward)
    })

    it('Should pass coordinates in [longitude, latitude] order to Turf (Sydney is the canary)', () => {
        const label = getDistanceLabel(AMSTERDAM, SYDNEY)

        expect(label.key).toBe('distance.km')
        expect(within(label.distance, 16649)).toBe(true)
    })

    it('Should only return translation keys that exist in every supported locale', () => {
        const possibleKeys = ['distance.km', 'distance.m'] as const

        for (const fullKey of possibleKeys) {
            const suffix = fullKey.replace(/^distance\./, '')
            expect(enLocale.distance).toHaveProperty(suffix)
            expect(nlLocale.distance).toHaveProperty(suffix)
        }
    })
})
