import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Coordinate, JumboStore } from '~~/shared/types/store'
import { everyDay, hours, supermarketFixture } from '~~/shared/types/store.mock'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'

import Header from './Header.vue'

// ~1.2 km north of supermarketFixture.location, mirroring the
// NEARBY_AMSTERDAM_1_2KM offset pattern (0.0108° latitude ≈ 1.2 km
// at this latitude). Used to exercise the distance branch of subtitle.
const userLocationNearSupermarket: Coordinate = {
    latitude: supermarketFixture.location.latitude + 0.0108,
    longitude: supermarketFixture.location.longitude,
}

const closedAllWeekStore: JumboStore = {
    ...supermarketFixture,
    openingHours: everyDay(hours('00:00', '00:00')),
}

const openTodayStore: JumboStore = {
    ...supermarketFixture,
    openingHours: everyDay(hours('08:00', '22:00')),
}

describe('StorePopupHeader', () => {
    beforeEach(async () => {
        await setI18nLocale('en')
        // Wednesday at 10:00 Amsterdam-time; supermarketFixture is open Wed 08:00–21:00.
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(new Date('2026-04-29T10:00:00+02:00'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('Should render the store name in the header', async () => {
        const wrapper = await mountWithUApp(Header, { store: supermarketFixture })

        expect(wrapper.find('[data-slot="name"]').text()).toBe(supermarketFixture.name)
    })

    it('Should render the brand avatar with the Jumbo asset', async () => {
        const wrapper = await mountWithUApp(Header, { store: supermarketFixture })

        const image = wrapper.find('img')
        expect(image.exists()).toBe(true)
        expect(image.attributes('src')).toContain('jumbo-brand-avatar.png')
        expect(image.attributes('alt')).toBe('Jumbo')
    })

    it('Should compose the subtitle as type and distance when a user location is provided', async () => {
        const wrapper = await mountWithUApp(Header, {
            store: supermarketFixture,
            userLocation: userLocationNearSupermarket,
        })

        expect(wrapper.text()).toMatch(/Supermarket · \d+(?:\.\d+)? km/)
    })

    it('Should render the subtitle without a distance suffix when no user location is provided', async () => {
        const wrapper = await mountWithUApp(Header, { store: supermarketFixture })

        expect(wrapper.text()).toContain('Supermarket')
        expect(wrapper.text()).not.toContain('km')
        expect(wrapper.text()).not.toMatch(/\d+\s*m\b/)
    })

    it('Should render the open status pill and a closes-at line when the store is currently open', async () => {
        const wrapper = await mountWithUApp(Header, { store: openTodayStore })

        expect(wrapper.text()).toContain('Open')
        expect(wrapper.text()).toMatch(/Closes at \d{2}:\d{2}/)
    })

    it('Should render the closed status pill when the store is currently closed', async () => {
        const wrapper = await mountWithUApp(Header, { store: closedAllWeekStore })

        expect(wrapper.text()).toContain('Closed')
    })

    it('Should emit close when the close button is clicked', async () => {
        const wrapper = await mountWithUApp(Header, { store: supermarketFixture })

        await wrapper.get('[aria-label="Close popup"]').trigger('click')

        const inner = wrapper.findComponent(Header)
        expect(inner.emitted('close')).toHaveLength(1)
    })

    it('Should render the close button with a localized aria-label in Dutch', async () => {
        await setI18nLocale('nl')

        const wrapper = await mountWithUApp(Header, { store: supermarketFixture })

        expect(wrapper.find('[aria-label="Popup sluiten"]').exists()).toBe(true)
    })
})
