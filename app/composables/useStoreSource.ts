import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'
import type { Ref, ShallowRef } from 'vue'
import { watch } from 'vue'

import type { JumboStoreFeatureCollection } from '../../shared/types/geojson'

export const STORES_SOURCE_ID = 'stores'

export const useStoreSource = (
    map: ShallowRef<MapboxMap | null>,
    featureCollection: Ref<JumboStoreFeatureCollection>,
) => {
    const addSourceOnLoad = (instance: MapboxMap) => {
        instance.on('load', () => {
            instance.addSource(STORES_SOURCE_ID, {
                type: 'geojson',
                data: featureCollection.value,
                cluster: true,
                clusterRadius: 30,
                clusterMaxZoom: 10,
            })
        })
    }

    watch(map, (instance) => {
        if (!instance) return
        addSourceOnLoad(instance)
    }, { immediate: true })

    watch(featureCollection, (next) => {
        const source = map.value?.getSource(STORES_SOURCE_ID) as GeoJSONSource | undefined
        source?.setData(next)
    })
}
