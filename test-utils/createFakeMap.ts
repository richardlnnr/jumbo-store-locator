import { vi } from 'vitest'

export const PIN_IMAGE = { width: 1, height: 1, data: new Uint8Array(4) }

export type LayerHandler = (event: { features?: Array<Record<string, unknown>> }) => void
export type LoadHandler = () => void
export type ResizeListener = () => void

export const createFakeMap = (initialClientHeight = 900) => {
    const layerHandlers = new Map<string, LayerHandler>()
    const loadHandlers: LoadHandler[] = []
    const resizeListeners = new Set<ResizeListener>()
    const canvasStyle: { cursor: string } = { cursor: '' }
    const canvas = { style: canvasStyle, clientHeight: initialClientHeight }

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
    const resize = vi.fn()

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
        resize,
        getCanvas: () => canvas,
        on: (
            event: string,
            layerOrHandler: string | LoadHandler | ResizeListener,
            maybeHandler?: LayerHandler,
        ) => {
            if (typeof layerOrHandler === 'function') {
                if (event === 'load') {
                    loadHandlers.push(layerOrHandler as LoadHandler)
                    ;(layerOrHandler as LoadHandler)()
                }
                else if (event === 'resize') {
                    resizeListeners.add(layerOrHandler as ResizeListener)
                }
                return
            }
            if (maybeHandler) {
                layerHandlers.set(`${event}:${layerOrHandler}`, maybeHandler)
            }
        },
        off: (event: string, handler: ResizeListener) => {
            if (event === 'resize') resizeListeners.delete(handler)
        },
    }

    const triggerResize = (nextHeight: number) => {
        canvas.clientHeight = nextHeight
        for (const listener of resizeListeners) listener()
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
            resize,
            easeTo,
            getClusterExpansionZoom,
        },
        layerHandlers,
        loadHandlers,
        canvasStyle,
        canvas,
        resizeListeners,
        triggerResize,
    }
}
