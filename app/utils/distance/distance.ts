import distance from '@turf/distance'

import type { DistanceLabel, DistancePrecision } from '../../../shared/types/distance'
import type { Coordinate } from '../../../shared/types/store'

const METERS_IN_KILOMETER = 1000
const METER_ROUNDING_STEP = 50
const COARSE_KM_FLOOR = 1

export const distanceKm = (a: Coordinate, b: Coordinate): number =>
    distance([a.longitude, a.latitude], [b.longitude, b.latitude])

export const getDistanceLabel = (
    a: Coordinate,
    b: Coordinate,
    precision: DistancePrecision = 'precise',
): DistanceLabel => {
    const km = distanceKm(a, b)

    if (precision === 'coarse') {
        return { key: 'distance.km-approx', distance: Math.max(COARSE_KM_FLOOR, Math.round(km)) }
    }

    const meters = Math.round((km * METERS_IN_KILOMETER) / METER_ROUNDING_STEP) * METER_ROUNDING_STEP

    if (meters < METERS_IN_KILOMETER) {
        return { key: 'distance.m', distance: meters }
    }

    return { key: 'distance.km', distance: Math.round(km * 10) / 10 }
}
