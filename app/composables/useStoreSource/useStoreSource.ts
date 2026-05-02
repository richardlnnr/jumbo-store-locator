import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'
import type { Ref, ShallowRef } from 'vue'
import { watch } from 'vue'

import type { JumboStoreFeatureCollection } from '../../../shared/types/geojson'

export const STORES_SOURCE_ID = 'stores'

const setupStoreSource = (
    instance: MapboxMap,
    featureCollection: Ref<JumboStoreFeatureCollection>,
) => {
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

export const useStoreSource = (
    map: ShallowRef<MapboxMap | null>,
    featureCollection: Ref<JumboStoreFeatureCollection>,
) => {
    watch(map, (instance) => {
        if (!instance) return
        setupStoreSource(instance, featureCollection)
    }, { immediate: true })

    watch(featureCollection, (next) => {
        const source = map.value?.getSource<GeoJSONSource>(STORES_SOURCE_ID)
        source?.setData(next)
    })
}
