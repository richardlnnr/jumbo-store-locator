export type DistanceLabelKey = 'distance.km' | 'distance.m'

export interface DistanceLabel {
    key: DistanceLabelKey
    distance: number
}
