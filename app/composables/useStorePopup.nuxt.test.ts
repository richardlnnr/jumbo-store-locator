import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { defineComponent, ref, shallowRef } from 'vue'
import type { Ref, ShallowRef } from 'vue'

import type { JumboStore } from '~~/shared/types/store'
import { supermarketFixture, virtualFixture } from '~~/shared/types/store.mock'
import { createFakeMap } from '~~/test-utils/createFakeMap'
import { useStorePopup } from './useStorePopup'

const popupMock = vi.hoisted(() => {
    const setDOMContent = vi.fn()
    const setLngLat = vi.fn()
    const addTo = vi.fn()
    const remove = vi.fn()

    const Popup = vi.fn(function (this: Record<string, unknown>, _options?: unknown) {
        Object.assign(this, {
            setDOMContent: (...args: unknown[]) => {
                setDOMContent(...args)
                return this
            },
            setLngLat: (...args: unknown[]) => {
                setLngLat(...args)
                return this
            },
            addTo: (...args: unknown[]) => {
                addTo(...args)
                return this
            },
            remove: (...args: unknown[]) => {
                remove(...args)
                return this
            },
        })
    })

    return { Popup, setDOMContent, setLngLat, addTo, remove }
})

vi.mock('mapbox-gl', () => ({
    default: { Popup: popupMock.Popup },
}))

interface Harness {
    map: ShallowRef<unknown>
    selectedStore: Ref<JumboStore | null>
    popupContainer: Ref<HTMLDivElement | null>
}

const mountHarness = async () => {
    const map = shallowRef<unknown>(null)
    const selectedStore = ref<JumboStore | null>(null)
    let popupContainer: Ref<HTMLDivElement | null> | null = null

    const TestHarness = defineComponent({
        setup: () => {
            const result = useStorePopup({
                map: map as never,
                selectedStore,
            })
            popupContainer = result.popupContainer
            return () => null
        },
    })

    const wrapper = await mountSuspended(TestHarness)
    return { wrapper, map, selectedStore, popupContainer: popupContainer! } satisfies { wrapper: unknown } & Harness
}

describe('useStorePopup', () => {
    beforeEach(() => {
        popupMock.Popup.mockClear()
        popupMock.setDOMContent.mockClear()
        popupMock.setLngLat.mockClear()
        popupMock.addTo.mockClear()
        popupMock.remove.mockClear()
    })

    it('Should expose a stable container element so the popup body can be teleported into it', async () => {
        const { popupContainer } = await mountHarness()

        expect(popupContainer.value).toBeInstanceOf(HTMLDivElement)
    })

    it('Should create a Mapbox Popup with the popup options when a store is first selected', async () => {
        const { fakeMap } = createFakeMap()
        const { map, selectedStore } = await mountHarness()

        map.value = fakeMap
        selectedStore.value = supermarketFixture
        await flushPromises()

        expect(popupMock.Popup).toHaveBeenCalledTimes(1)
        const options = popupMock.Popup.mock.calls[0]![0]
        expect(options).toMatchObject({
            closeButton: false,
            closeOnClick: false,
            closeOnMove: false,
            anchor: 'bottom',
        })
    })

    it('Should attach the container element via setDOMContent and add the popup to the map', async () => {
        const { fakeMap } = createFakeMap()
        const { map, selectedStore, popupContainer } = await mountHarness()

        map.value = fakeMap
        selectedStore.value = supermarketFixture
        await flushPromises()

        expect(popupMock.setDOMContent).toHaveBeenCalledWith(popupContainer.value)
        expect(popupMock.addTo).toHaveBeenCalledWith(fakeMap)
    })

    it('Should set the popup position to the selected store coordinates and ease the map to that point with top padding so the popup has vertical room', async () => {
        const { fakeMap, spies: { easeTo } } = createFakeMap()
        const { map, selectedStore } = await mountHarness()

        map.value = fakeMap
        selectedStore.value = supermarketFixture
        await flushPromises()

        const expectedLngLat = [supermarketFixture.location.longitude, supermarketFixture.location.latitude]
        expect(popupMock.setLngLat).toHaveBeenCalledWith(expectedLngLat)
        expect(easeTo).toHaveBeenCalledTimes(1)
        const easeToOptions = easeTo.mock.calls[0]![0] as { center: number[], padding: { top: number } }
        expect(easeToOptions.center).toEqual(expectedLngLat)
        expect(easeToOptions.padding).toMatchObject({ top: expect.any(Number) })
        expect(easeToOptions.padding.top).toBeGreaterThan(0)
    })

    it('Should clamp easeTo padding so it never exceeds the canvas height when the map is short', async () => {
        const { fakeMap, spies: { easeTo } } = createFakeMap(600)
        const { map, selectedStore } = await mountHarness()

        map.value = fakeMap
        selectedStore.value = supermarketFixture
        await flushPromises()

        const padding = (easeTo.mock.calls[0]![0] as { padding: { top: number } }).padding
        // canvas 600 -> padding 480 (600 - 120 viewport margin)
        expect(padding.top).toBe(480)
    })

    it('Should clamp easeTo padding to a minimum so a tiny canvas still receives a positive bias', async () => {
        const { fakeMap, spies: { easeTo } } = createFakeMap(200)
        const { map, selectedStore } = await mountHarness()

        map.value = fakeMap
        selectedStore.value = supermarketFixture
        await flushPromises()

        const padding = (easeTo.mock.calls[0]![0] as { padding: { top: number } }).padding
        expect(padding.top).toBe(120)
    })

    it('Should cap easeTo padding so a very tall canvas does not over-push the pin to the bottom', async () => {
        const { fakeMap, spies: { easeTo } } = createFakeMap(2000)
        const { map, selectedStore } = await mountHarness()

        map.value = fakeMap
        selectedStore.value = supermarketFixture
        await flushPromises()

        const padding = (easeTo.mock.calls[0]![0] as { padding: { top: number } }).padding
        expect(padding.top).toBe(720)
    })

    it('Should reposition the existing popup when switching between stores without re-creating it', async () => {
        const { fakeMap } = createFakeMap()
        const { map, selectedStore } = await mountHarness()

        map.value = fakeMap
        selectedStore.value = supermarketFixture
        await flushPromises()
        popupMock.setLngLat.mockClear()

        selectedStore.value = virtualFixture
        await flushPromises()

        expect(popupMock.Popup).toHaveBeenCalledTimes(1)
        expect(popupMock.setLngLat).toHaveBeenCalledTimes(1)
        expect(popupMock.setLngLat).toHaveBeenCalledWith([virtualFixture.location.longitude, virtualFixture.location.latitude])
    })

    it('Should remove the popup when the selection is cleared', async () => {
        const { fakeMap } = createFakeMap()
        const { map, selectedStore } = await mountHarness()

        map.value = fakeMap
        selectedStore.value = supermarketFixture
        await flushPromises()

        selectedStore.value = null
        await flushPromises()

        expect(popupMock.remove).toHaveBeenCalledTimes(1)
    })

    it('Should remove the popup when the harness is unmounted', async () => {
        const { fakeMap } = createFakeMap()
        const { wrapper, map, selectedStore } = await mountHarness() as { wrapper: { unmount: () => void } } & Harness

        map.value = fakeMap
        selectedStore.value = supermarketFixture
        await flushPromises()

        wrapper.unmount()

        expect(popupMock.remove).toHaveBeenCalled()
    })

    it('Should do nothing while the map instance is not yet available', async () => {
        const { selectedStore } = await mountHarness()

        selectedStore.value = supermarketFixture
        await flushPromises()

        expect(popupMock.Popup).not.toHaveBeenCalled()
        expect(popupMock.addTo).not.toHaveBeenCalled()
    })

    it('Should expose the canvas-derived popup height cap as a --store-popup-max-h CSS variable on the container so the card stays inside the map region', async () => {
        const { fakeMap } = createFakeMap(528)
        const { map, selectedStore, popupContainer } = await mountHarness()

        map.value = fakeMap
        selectedStore.value = supermarketFixture
        await flushPromises()

        // canvas 528 -> max height 408 (528 - 120 viewport margin)
        expect(popupContainer.value!.style.getPropertyValue('--store-popup-max-h')).toBe('408px')
    })

    it('Should clamp the popup height cap to the minimum on a tiny canvas', async () => {
        const { fakeMap } = createFakeMap(150)
        const { map, selectedStore, popupContainer } = await mountHarness()

        map.value = fakeMap
        selectedStore.value = supermarketFixture
        await flushPromises()

        expect(popupContainer.value!.style.getPropertyValue('--store-popup-max-h')).toBe('200px')
    })

    it('Should refresh the popup height cap when the map fires a resize event so the popup follows viewport changes', async () => {
        const { fakeMap, triggerResize } = createFakeMap(900)
        const { map, selectedStore, popupContainer } = await mountHarness()

        map.value = fakeMap
        selectedStore.value = supermarketFixture
        await flushPromises()

        expect(popupContainer.value!.style.getPropertyValue('--store-popup-max-h')).toBe('780px')

        triggerResize(528)

        expect(popupContainer.value!.style.getPropertyValue('--store-popup-max-h')).toBe('408px')
    })

    it('Should detach the resize listener when the harness is unmounted', async () => {
        const { fakeMap, resizeListeners } = createFakeMap()
        const { wrapper, map, selectedStore } = await mountHarness() as { wrapper: { unmount: () => void } } & Harness

        map.value = fakeMap
        selectedStore.value = supermarketFixture
        await flushPromises()
        expect(resizeListeners.size).toBe(1)

        wrapper.unmount()

        expect(resizeListeners.size).toBe(0)
    })

    it('Should detach the resize listener when the selection is cleared so a stale popup does not keep listening', async () => {
        const { fakeMap, resizeListeners } = createFakeMap()
        const { map, selectedStore } = await mountHarness()

        map.value = fakeMap
        selectedStore.value = supermarketFixture
        await flushPromises()
        expect(resizeListeners.size).toBe(1)

        selectedStore.value = null
        await flushPromises()

        expect(resizeListeners.size).toBe(0)
    })
})
