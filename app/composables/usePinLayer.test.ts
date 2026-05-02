import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, shallowRef } from 'vue'

import { createFakeMap, PIN_IMAGE } from '../../test-utils/createFakeMap'
import { usePinLayer } from './usePinLayer'

type FakeMap = ReturnType<typeof createFakeMap>['fakeMap']

const flushAsync = async () => {
    await nextTick()
    await Promise.resolve()
    await nextTick()
}

const mountPinLayer = async (
    setupHarness?: (harness: ReturnType<typeof createFakeMap>) => void,
    onPinClick?: (storeId: string) => void,
) => {
    const harness = createFakeMap()
    setupHarness?.(harness)

    const mapRef = shallowRef<FakeMap | null>(null)
    const scope = effectScope()
    scope.run(() => {
        usePinLayer(mapRef as never, onPinClick)
    })

    mapRef.value = harness.fakeMap
    await flushAsync()

    return { ...harness, scope }
}

describe('usePinLayer', () => {
    let activeScope: ReturnType<typeof effectScope> | null = null

    beforeEach(() => {
        activeScope = null
    })

    afterEach(() => {
        activeScope?.stop()
    })

    it('Should load the Jumbo pin image and register it under the "jumbo-pin" id when the map loads', async () => {
        const { spies, scope } = await mountPinLayer()
        activeScope = scope

        expect(spies.loadImage).toHaveBeenCalledTimes(1)
        expect(spies.loadImage.mock.calls[0]![0]).toBe('/jumbo-pin.png')
        expect(spies.addImage).toHaveBeenCalledTimes(1)
        const [imageId, image, options] = spies.addImage.mock.calls[0]!
        expect(imageId).toBe('jumbo-pin')
        expect(image).toBe(PIN_IMAGE)
        expect(options).toEqual({ pixelRatio: 2 })
    })

    it('Should add a symbol layer that filters out clusters and uses the Jumbo pin icon with zoom-interpolated size', async () => {
        const { spies, scope } = await mountPinLayer()
        activeScope = scope

        const pinCall = spies.addLayer.mock.calls.find(([layer]) => layer.id === 'stores-pins')
        expect(pinCall).toBeDefined()
        const [layer] = pinCall!
        expect(layer).toMatchObject({
            id: 'stores-pins',
            type: 'symbol',
            source: 'stores',
            filter: ['!', ['has', 'point_count']],
            layout: {
                'icon-image': 'jumbo-pin',
                'icon-size': ['interpolate', ['linear'], ['zoom'], 8, 0.3, 14, 0.5],
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
                'icon-anchor': 'bottom',
            },
        })
    })

    it('Should skip loading and registering the image when the Jumbo pin is already on the map', async () => {
        const { spies, scope } = await mountPinLayer((harness) => {
            harness.spies.hasImage.mockImplementation(() => true)
        })
        activeScope = scope

        expect(spies.loadImage).not.toHaveBeenCalled()
        expect(spies.addImage).not.toHaveBeenCalled()
        expect(spies.addLayer).toHaveBeenCalledTimes(1)
        expect(spies.addLayer.mock.calls[0]![0].id).toBe('stores-pins')
    })

    it('Should skip the pin symbol layer and log an error when the Jumbo pin image fails to load', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const failure = new Error('Network failure')

        const { spies, scope } = await mountPinLayer((harness) => {
            harness.spies.loadImage.mockImplementation((_url, callback) => {
                callback(failure, null)
            })
        })
        activeScope = scope

        expect(spies.loadImage).toHaveBeenCalledTimes(1)
        expect(spies.addImage).not.toHaveBeenCalled()
        expect(spies.addLayer).not.toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[StoreMap] failed to load Jumbo pin image',
            failure,
        )

        consoleErrorSpy.mockRestore()
    })

    it('Should switch the canvas cursor to a pointer on mouseenter and reset it on mouseleave for the pin layer', async () => {
        const { layerHandlers, canvasStyle, scope } = await mountPinLayer()
        activeScope = scope

        const enterHandler = layerHandlers.get('mouseenter:stores-pins')
        const leaveHandler = layerHandlers.get('mouseleave:stores-pins')
        expect(enterHandler).toBeDefined()
        expect(leaveHandler).toBeDefined()

        enterHandler!({})
        expect(canvasStyle.cursor).toBe('pointer')

        leaveHandler!({})
        expect(canvasStyle.cursor).toBe('')
    })

    it('Should invoke the onPinClick callback with the clicked feature storeId', async () => {
        const onPinClick = vi.fn()
        const { layerHandlers, scope } = await mountPinLayer(undefined, onPinClick)
        activeScope = scope

        const clickHandler = layerHandlers.get('click:stores-pins')
        expect(clickHandler).toBeDefined()

        clickHandler!({
            features: [{ properties: { storeId: '3126' } }],
        })

        expect(onPinClick).toHaveBeenCalledWith('3126')
    })

    it('Should ignore pin click events that have no features', async () => {
        const onPinClick = vi.fn()
        const { layerHandlers, scope } = await mountPinLayer(undefined, onPinClick)
        activeScope = scope

        const clickHandler = layerHandlers.get('click:stores-pins')
        clickHandler!({})
        clickHandler!({ features: [] })

        expect(onPinClick).not.toHaveBeenCalled()
    })

    it('Should not register a click handler when no onPinClick callback is provided', async () => {
        const { layerHandlers, scope } = await mountPinLayer()
        activeScope = scope

        expect(layerHandlers.has('click:stores-pins')).toBe(false)
    })
})
