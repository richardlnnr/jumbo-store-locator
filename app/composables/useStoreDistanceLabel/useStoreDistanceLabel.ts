import type { DistanceLabel } from '../../../shared/types/distance'
import type { JumboStoreFeature } from '../../../shared/types/geojson'
import { useStoreLocator } from '../../stores/useStoreLocator'
import { getDistanceLabel } from '../../utils/distance/distance'

export const useStoreDistanceLabel = () => {
    const store = useStoreLocator()
    return (feature: JumboStoreFeature): DistanceLabel | null =>
        store.userLocation
            ? getDistanceLabel(store.userLocation, feature.properties.location)
            : null
}
