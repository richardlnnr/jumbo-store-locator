import bboxPolygon from '@turf/bbox-polygon'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'

import type { Coordinate } from '../../types/store'

const NETHERLANDS_AREA = bboxPolygon([3, 50, 8, 54])

export const isInNetherlands = (coordinate: Coordinate): boolean =>
    booleanPointInPolygon([coordinate.longitude, coordinate.latitude], NETHERLANDS_AREA)
