import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useUserLocationStore } from '~~/app/stores/useUserLocationStore'
import type { Coordinate } from '~~/shared/types/store'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'

import ConsentBanner from './ConsentBanner.vue'

const PRECISE: Coordinate = { latitude: 52.3702, longitude: 4.8952 }

describe('StoreListConsentBanner', () => {
    beforeEach(async () => {
        useUserLocationStore().$resetForTests()
        await setI18nLocale('en')
    })

    afterEach(() => {
        useUserLocationStore().$resetForTests()
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('Should render the banner when permission state is prompt', async () => {
        useUserLocationStore().permissionState = 'prompt'

        const wrapper = await mountWithUApp(ConsentBanner)

        const banner = wrapper.find('[data-slot="consent-banner"]')
        expect(banner.exists()).toBe(true)
        expect(banner.text()).toContain('Find nearby stores with your precise location')
        expect(banner.find('a[href="/privacy"]').exists()).toBe(true)
    })

    it('Should hide the banner while the permission state is still unknown', async () => {
        useUserLocationStore().permissionState = 'unknown'

        const wrapper = await mountWithUApp(ConsentBanner)

        expect(wrapper.find('[data-slot="consent-banner"]').exists()).toBe(false)
    })

    it('Should hide the banner when permission state is granted', async () => {
        useUserLocationStore().permissionState = 'granted'

        const wrapper = await mountWithUApp(ConsentBanner)

        expect(wrapper.find('[data-slot="consent-banner"]').exists()).toBe(false)
    })

    it('Should hide the banner when permission state is denied', async () => {
        useUserLocationStore().permissionState = 'denied'

        const wrapper = await mountWithUApp(ConsentBanner)

        expect(wrapper.find('[data-slot="consent-banner"]').exists()).toBe(false)
    })

    it('Should hide the banner while userLocation.state is loading', async () => {
        const store = useUserLocationStore()
        store.permissionState = 'prompt'
        store.state = 'loading'

        const wrapper = await mountWithUApp(ConsentBanner)

        expect(wrapper.find('[data-slot="consent-banner"]').exists()).toBe(false)
    })

    it('Should hide the banner after dismiss is called', async () => {
        const store = useUserLocationStore()
        store.permissionState = 'prompt'

        const wrapper = await mountWithUApp(ConsentBanner)
        store.dismissBanner()
        await wrapper.vm.$nextTick()

        expect(wrapper.find('[data-slot="consent-banner"]').exists()).toBe(false)
    })

    it('Should write a precise coordinate when the allow button is clicked and the prompt resolves', async () => {
        const store = useUserLocationStore()
        store.permissionState = 'prompt'

        const getCurrentPosition = vi.fn((success: PositionCallback): void => {
            success({
                coords: {
                    latitude: PRECISE.latitude,
                    longitude: PRECISE.longitude,
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

        const wrapper = await mountWithUApp(ConsentBanner)

        const allowButton = wrapper.findAll('button').find((button: { text: () => string }) =>
            button.text().includes('Allow'))
        expect(allowButton).toBeDefined()
        await allowButton!.trigger('click')

        await vi.waitFor(() => {
            expect(store.source).toBe('precise')
            expect(store.permissionState).toBe('granted')
        })
        expect(getCurrentPosition).toHaveBeenCalledTimes(1)
    })

    it('Should flip bannerDismissed when the dismiss button is clicked', async () => {
        const store = useUserLocationStore()
        store.permissionState = 'prompt'

        const wrapper = await mountWithUApp(ConsentBanner)

        const dismissButton = wrapper.findAll('button').find((button: { text: () => string }) =>
            button.text().includes('Not now'))
        expect(dismissButton).toBeDefined()
        await dismissButton!.trigger('click')

        expect(store.bannerDismissed).toBe(true)
    })
})
