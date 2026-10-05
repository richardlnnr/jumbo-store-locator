import type { DistanceLabel } from '../../../shared/types/distance'
import type { StoreLocation } from '../../../shared/types/store'
import { useUserLocationStore } from '../../stores/useUserLocationStore'
import { getDistanceLabel } from '../../utils/distance/distance'

export const useStoreDistanceLabel = () => {
    const userLocation = useUserLocationStore()
    return (storeLocation: StoreLocation): DistanceLabel | null => {
        if (!userLocation.coordinate) return null
        const precision = userLocation.source === 'coarse' ? 'coarse' : 'precise'
        return getDistanceLabel(userLocation.coordinate, storeLocation, precision)
    }
}
