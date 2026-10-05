export type DistanceLabelKey = 'distance.km' | 'distance.m' | 'distance.km-approx'

export type DistancePrecision = 'precise' | 'coarse'

export interface DistanceLabel {
    key: DistanceLabelKey
    distance: number
}
