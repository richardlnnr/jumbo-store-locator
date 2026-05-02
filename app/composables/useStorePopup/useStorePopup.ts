import type { Map as MapboxMap, Popup } from 'mapbox-gl'
import type { Ref, ShallowRef } from 'vue'
import { onScopeDispose, ref, watch } from 'vue'

import type { JumboStore } from '../../../shared/types/store'
import {
    createStorePopup,
    easeMapToPin,
    setPopupMaxHeightVar,
} from '../../utils/storePopupSizing/storePopupSizing'

interface UseStorePopupOptions {
    map: ShallowRef<MapboxMap | null>
    selectedStore: Ref<JumboStore | null>
}

export const useStorePopup = ({ map, selectedStore }: UseStorePopupOptions) => {
    const popupContainer = ref<HTMLDivElement | null>(null)
    let popup: Popup | null = null
    let resizeListener: (() => void) | null = null

    if (import.meta.client) {
        popupContainer.value = document.createElement('div')
    }

    const attachResizeListener = (instance: MapboxMap, container: HTMLElement) => {
        resizeListener = () => setPopupMaxHeightVar(container, instance.getCanvas().clientHeight)
        instance.on('resize', resizeListener)
    }

    const detachResizeListener = (instance: MapboxMap) => {
        if (!resizeListener) return
        instance.off('resize', resizeListener)
        resizeListener = null
    }

    const removePopup = (instance: MapboxMap) => {
        detachResizeListener(instance)
        popup?.remove()
        popup = null
    }

    watch([map, selectedStore], async ([instance, store]) => {
        const container = popupContainer.value
        if (!instance || !container) return

        if (!store) {
            removePopup(instance)
            return
        }

        const lngLat: [number, number] = [store.location.longitude, store.location.latitude]

        if (popup) {
            popup.setLngLat(lngLat)
        }
        else {
            popup = await createStorePopup(instance, container, lngLat)
            attachResizeListener(instance, container)
        }

        const canvasHeight = instance.getCanvas().clientHeight
        setPopupMaxHeightVar(container, canvasHeight)
        easeMapToPin(instance, lngLat, canvasHeight)
    }, { immediate: true })

    onScopeDispose(() => {
        if (map.value) detachResizeListener(map.value)
        popup?.remove()
        popup = null
    })

    return { popupContainer }
}
