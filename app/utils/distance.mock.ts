import type { Coordinate } from '../../shared/types/store'

export const AMSTERDAM: Coordinate = { latitude: 52.3676, longitude: 4.9041 }
export const ROTTERDAM: Coordinate = { latitude: 51.9244, longitude: 4.4777 }
export const SYDNEY: Coordinate = { latitude: -33.8688, longitude: 151.2093 }

// At Amsterdam latitude (~52 degrees), 1 degree of latitude is about 111 km.
// The offsets below give roughly the labelled distance and are used to
// exercise the meter/kilometer cutover and the meter rounding step without
// depending on exact reference values.
export const NEARBY_AMSTERDAM_500M: Coordinate = {
    latitude: AMSTERDAM.latitude + 0.0045,
    longitude: AMSTERDAM.longitude,
}
export const NEARBY_AMSTERDAM_1_2KM: Coordinate = {
    latitude: AMSTERDAM.latitude + 0.0108,
    longitude: AMSTERDAM.longitude,
}

// Just under 1 km: lands in the rounding zone where 50 m rounding pushes
// the meter value to exactly 1000. Locks in the meter-to-km rollover so the
// label flips to "1.0 km" instead of rendering as "1000 m".
export const NEARBY_AMSTERDAM_990M: Coordinate = {
    latitude: AMSTERDAM.latitude + 0.0089,
    longitude: AMSTERDAM.longitude,
}
