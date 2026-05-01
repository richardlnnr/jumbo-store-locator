import type { Map as MapboxMap } from 'mapbox-gl'
import type { ShallowRef } from 'vue'
import { watch } from 'vue'

import { STORES_SOURCE_ID } from './useStoreSource'

const PIN_IMAGE_ID = 'jumbo-pin'
const PIN_IMAGE_URL = '/jumbo-pin.png'
const PINS_LAYER_ID = 'stores-pins'

const loadPinImage = (instance: MapboxMap) =>
    new Promise<void>((resolve, reject) => {
        if (instance.hasImage(PIN_IMAGE_ID)) {
            resolve()
            return
        }
        instance.loadImage(PIN_IMAGE_URL, (error, image) => {
            if (error || !image) {
                reject(error ?? new Error('Failed to load Jumbo pin image'))
                return
            }
            if (!instance.hasImage(PIN_IMAGE_ID)) {
                instance.addImage(PIN_IMAGE_ID, image, { pixelRatio: 2 })
            }
            resolve()
        })
    })

export const usePinLayer = (map: ShallowRef<MapboxMap | null>) => {
    const setup = (instance: MapboxMap) => {
        instance.on('load', async () => {
            try {
                await loadPinImage(instance)
            }
            catch (error) {
                console.error('[StoreMap] failed to load Jumbo pin image', error)
                return
            }

            instance.addLayer({
                id: PINS_LAYER_ID,
                type: 'symbol',
                source: STORES_SOURCE_ID,
                filter: ['!', ['has', 'point_count']],
                layout: {
                    'icon-image': PIN_IMAGE_ID,
                    'icon-size': ['interpolate', ['linear'], ['zoom'], 8, 0.3, 14, 0.5],
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': true,
                    'icon-anchor': 'bottom',
                },
            })
        })
    }

    watch(map, (instance) => {
        if (!instance) return
        setup(instance)
    }, { immediate: true })
}
