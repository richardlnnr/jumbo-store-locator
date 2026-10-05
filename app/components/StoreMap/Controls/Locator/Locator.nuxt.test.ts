import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useUserLocationStore } from '~~/app/stores/useUserLocationStore'
import type { Coordinate } from '~~/shared/types/store'
import { createFakeMap } from '~~/test-utils/createFakeMap'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'

import Locator from './Locator.vue'

const AMSTERDAM: Coordinate = { latitude: 52.3702, longitude: 4.8952 }

const buildFakeMap = () => createFakeMap().fakeMap

const stubGeolocationSuccess = (coordinate: Coordinate) => {
    const getCurrentPosition = vi.fn((success: PositionCallback): void => {
        success({
            coords: {
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
                toJSON: () => ({}),
            },
            timestamp: Date.now(),
            toJSON: () => ({}),
        } as GeolocationPosition)
    })
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
    return getCurrentPosition
}

const stubGeolocationFailure = (code: number) => {
    const getCurrentPosition = vi.fn((
        _success: PositionCallback,
        failure: PositionErrorCallback | null | undefined,
    ): void => {
        failure?.({
            code,
            message: '',
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
        } as GeolocationPositionError)
    })
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
    vi.stubGlobal('fetch', vi.fn(async () => {
        throw new Error('coarse-unavailable')
    }))
    return getCurrentPosition
}

describe('StoreMapControlsLocator', () => {
    beforeEach(async () => {
        useUserLocationStore().$resetForTests()
        await setI18nLocale('en')
    })

    afterEach(() => {
        useUserLocationStore().$resetForTests()
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('Should render the idle state and "Use my location" tooltip when no source is set', async () => {
        const wrapper = await mountWithUApp(Locator, { map: buildFakeMap() })

        const slot = wrapper.find('[data-slot="locator-button"]')
        const button = wrapper.find('button')
        expect(slot.attributes('data-state')).toBe('idle')
        expect((button.element as HTMLButtonElement).getAttribute('aria-label')).toBe('Use my location')
    })

    it('Should horizontally center the icon inside the 40x40 button', async () => {
        const wrapper = await mountWithUApp(Locator, { map: buildFakeMap() })

        const button = wrapper.find('button')
        expect(button.classes()).toContain('justify-center')
    })

    it('Should render the upgrade tooltip when a coarse source is already set', async () => {
        useUserLocationStore().setCoarseLocation(AMSTERDAM)

        const wrapper = await mountWithUApp(Locator, { map: buildFakeMap() })

        const slot = wrapper.find('[data-slot="locator-button"]')
        expect(slot.attributes('data-state')).toBe('idle')
        expect((wrapper.find('button').element as HTMLButtonElement).getAttribute('aria-label'))
            .toBe('Use my exact location')
    })

    it('Should render the granted state when the store owns a precise coordinate', async () => {
        useUserLocationStore().setPreciseLocation(AMSTERDAM)

        const wrapper = await mountWithUApp(Locator, { map: buildFakeMap() })

        expect(wrapper.find('[data-slot="locator-button"]').attributes('data-state')).toBe('granted')
    })

    it('Should render the locating state with a spinning icon while resolving', async () => {
        useUserLocationStore().state = 'loading'

        const wrapper = await mountWithUApp(Locator, { map: buildFakeMap() })

        const slot = wrapper.find('[data-slot="locator-button"]')
        expect(slot.attributes('data-state')).toBe('locating')
        expect((wrapper.find('button').element as HTMLButtonElement).getAttribute('aria-label'))
            .toBe('Locating…')
        expect(wrapper.find('.animate-spin').exists()).toBe(true)
    })

    it('Should render the blocked state when permission is denied', async () => {
        useUserLocationStore().permissionState = 'denied'

        const wrapper = await mountWithUApp(Locator, { map: buildFakeMap() })

        const slot = wrapper.find('[data-slot="locator-button"]')
        expect(slot.attributes('data-state')).toBe('blocked')
        expect((wrapper.find('button').element as HTMLButtonElement).getAttribute('aria-label'))
            .toContain('Location blocked')
    })

    it('Should render the blocked state when geolocation is unsupported', async () => {
        useUserLocationStore().permissionState = 'unsupported'

        const wrapper = await mountWithUApp(Locator, { map: buildFakeMap() })

        expect(wrapper.find('[data-slot="locator-button"]').attributes('data-state')).toBe('blocked')
    })

    it('Should render the retry state after a transient error', async () => {
        const store = useUserLocationStore()
        store.state = 'error'
        store.error = 'timeout'

        const wrapper = await mountWithUApp(Locator, { map: buildFakeMap() })

        const slot = wrapper.find('[data-slot="locator-button"]')
        expect(slot.attributes('data-state')).toBe('retry')
        expect((wrapper.find('button').element as HTMLButtonElement).getAttribute('aria-label'))
            .toBe('Try again')
    })

    it('Should call flyTo with the precise coordinate after a successful click resolution', async () => {
        const fake = createFakeMap()
        stubGeolocationSuccess(AMSTERDAM)

        const wrapper = await mountWithUApp(Locator, { map: fake.fakeMap })
        await wrapper.find('button').trigger('click')

        await vi.waitFor(() => {
            expect(fake.spies.flyTo).toHaveBeenCalledWith({
                center: [AMSTERDAM.longitude, AMSTERDAM.latitude],
                zoom: 13,
            })
        })
        expect(useUserLocationStore().source).toBe('precise')
    })

    it('Should not call flyTo when both precise and coarse resolution fail', async () => {
        const fake = createFakeMap()
        stubGeolocationFailure(1)

        const wrapper = await mountWithUApp(Locator, { map: fake.fakeMap })
        await wrapper.find('button').trigger('click')
        await vi.waitFor(() => {
            expect(useUserLocationStore().source).toBeNull()
        })

        expect(fake.spies.flyTo).not.toHaveBeenCalled()
    })

    it('Should be disabled while locating and not invoke geolocation on click', async () => {
        const fake = createFakeMap()
        const getCurrentPosition = stubGeolocationSuccess(AMSTERDAM)
        useUserLocationStore().state = 'loading'

        const wrapper = await mountWithUApp(Locator, { map: fake.fakeMap })
        const button = wrapper.find('button')

        expect((button.element as HTMLButtonElement).disabled).toBe(true)
        await button.trigger('click')
        expect(getCurrentPosition).not.toHaveBeenCalled()
        expect(fake.spies.flyTo).not.toHaveBeenCalled()
    })

    it('Should be disabled when blocked and not invoke geolocation on click', async () => {
        const fake = createFakeMap()
        const getCurrentPosition = stubGeolocationSuccess(AMSTERDAM)
        useUserLocationStore().permissionState = 'denied'

        const wrapper = await mountWithUApp(Locator, { map: fake.fakeMap })
        const button = wrapper.find('button')

        expect((button.element as HTMLButtonElement).disabled).toBe(true)
        await button.trigger('click')
        expect(getCurrentPosition).not.toHaveBeenCalled()
        expect(fake.spies.flyTo).not.toHaveBeenCalled()
    })
})
