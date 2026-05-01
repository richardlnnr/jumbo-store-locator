import { vi } from 'vitest'

export const PIN_IMAGE = { width: 1, height: 1, data: new Uint8Array(4) }

export type LayerHandler = (event: { features?: Array<Record<string, unknown>> }) => void
export type LoadHandler = () => void

export const createFakeMap = () => {
    const layerHandlers = new Map<string, LayerHandler>()
    const loadHandlers: LoadHandler[] = []
    const canvasStyle: { cursor: string } = { cursor: '' }

    const setData = vi.fn()
    const easeTo = vi.fn()
    const getClusterExpansionZoom = vi.fn(
        (_clusterId: number, callback: (error: Error | null, zoom: number) => void) => {
            callback(null, 11)
        },
    )
    const addSource = vi.fn()
    const getSource = vi.fn(() => ({ setData, getClusterExpansionZoom }))
    const addLayer = vi.fn()
    const getLayer = vi.fn<(id: string) => unknown>(id =>
        id === 'building-entrance' ? { id } : undefined,
    )
    const addImage = vi.fn()
    const hasImage = vi.fn(() => false)
    const loadImage = vi.fn(
        (
            _url: string,
            callback: (error: Error | null, image: typeof PIN_IMAGE | null) => void,
        ) => {
            callback(null, PIN_IMAGE)
        },
    )
    const remove = vi.fn()

    const fakeMap = {
        addSource,
        getSource,
        addLayer,
        getLayer,
        addImage,
        hasImage,
        loadImage,
        easeTo,
        remove,
        getCanvas: () => ({ style: canvasStyle }),
        on: (
            event: string,
            layerOrHandler: string | LoadHandler,
            maybeHandler?: LayerHandler,
        ) => {
            if (typeof layerOrHandler === 'function') {
                if (event === 'load') {
                    loadHandlers.push(layerOrHandler)
                    layerOrHandler()
                }
                return
            }
            if (maybeHandler) {
                layerHandlers.set(`${event}:${layerOrHandler}`, maybeHandler)
            }
        },
    }

    return {
        fakeMap,
        spies: {
            setData,
            addSource,
            getSource,
            addLayer,
            getLayer,
            addImage,
            hasImage,
            loadImage,
            remove,
            easeTo,
            getClusterExpansionZoom,
        },
        layerHandlers,
        loadHandlers,
        canvasStyle,
    }
}
