import distance from '@turf/distance'

import type { DistanceLabel } from '../../shared/types/distance'
import type { Coordinate } from '../../shared/types/store'

const METERS_IN_KILOMETER = 1000
const METER_ROUNDING_STEP = 50

export const distanceKm = (a: Coordinate, b: Coordinate): number =>
    distance([a.longitude, a.latitude], [b.longitude, b.latitude])

export const getDistanceLabel = (a: Coordinate, b: Coordinate): DistanceLabel => {
    const km = distanceKm(a, b)

    if (km < 1) {
        const meters = Math.round((km * METERS_IN_KILOMETER) / METER_ROUNDING_STEP) * METER_ROUNDING_STEP
        return { key: 'distance.m', distance: meters }
    }

    return { key: 'distance.km', distance: Math.round(km * 10) / 10 }
}
