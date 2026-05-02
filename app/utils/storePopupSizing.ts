import type { Map as MapboxMap, Popup, PopupOptions } from 'mapbox-gl'

const EASE_PADDING_MIN = 120
const EASE_PADDING_MAX = 720
const POPUP_VIEWPORT_MARGIN = 120
const POPUP_MIN_HEIGHT = 200

const POPUP_OPTIONS: PopupOptions = {
    closeButton: false,
    closeOnClick: false,
    closeOnMove: false,
    anchor: 'bottom',
    offset: 32,
    maxWidth: '380px',
    className: 'store-popup',
}

export const computeEasePaddingTop = (canvasHeight: number): number =>
    Math.max(
        EASE_PADDING_MIN,
        Math.min(EASE_PADDING_MAX, canvasHeight - POPUP_VIEWPORT_MARGIN),
    )

export const computePopupMaxHeight = (canvasHeight: number): number =>
    Math.max(POPUP_MIN_HEIGHT, canvasHeight - POPUP_VIEWPORT_MARGIN)

export const setPopupMaxHeightVar = (container: HTMLElement, canvasHeight: number): void => {
    container.style.setProperty(
        '--store-popup-max-h',
        `${computePopupMaxHeight(canvasHeight)}px`,
    )
}

export const easeMapToPin = (
    instance: MapboxMap,
    lngLat: [number, number],
    canvasHeight: number,
): void => {
    instance.easeTo({
        center: lngLat,
        padding: {
            top: computeEasePaddingTop(canvasHeight),
            bottom: 0,
            left: 0,
            right: 0,
        },
    })
}

export const createStorePopup = async (
    instance: MapboxMap,
    container: HTMLElement,
    lngLat: [number, number],
): Promise<Popup> => {
    const mapboxgl = (await import('mapbox-gl')).default
    return new mapboxgl.Popup(POPUP_OPTIONS)
        .setDOMContent(container)
        .setLngLat(lngLat)
        .addTo(instance)
}
