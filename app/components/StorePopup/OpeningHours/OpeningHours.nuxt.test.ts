import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { everyDay, hours, supermarketFixture, weekHours } from '~~/shared/types/store.mock'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'

import OpeningHours from './OpeningHours.vue'

const openTodayHours = everyDay(hours('08:00', '22:00'))

describe('StorePopupOpeningHours', () => {
    beforeEach(async () => {
        await setI18nLocale('en')
        // Wednesday at 10:00 Amsterdam-time.
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(new Date('2026-04-29T10:00:00+02:00'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('Should render seven rows — one for every day of the week', async () => {
        const wrapper = await mountWithUApp(OpeningHours, { openingHours: openTodayHours })

        const rows = wrapper.findAll('ul li[class*="rounded-lg"]')
        expect(rows.length).toBeGreaterThanOrEqual(7)
    })

    it('Should highlight the row for today and prefix it with the localized "Today" label', async () => {
        const wrapper = await mountWithUApp(OpeningHours, { openingHours: openTodayHours })

        const todayRow = wrapper.find('[data-today="true"]')
        expect(todayRow.exists()).toBe(true)
        expect(todayRow.text()).toContain('Today')
        expect(todayRow.text()).toContain('Wednesday')
        expect(todayRow.text()).toContain('08:00')
        expect(todayRow.text()).toContain('22:00')
    })

    it('Should render the closed-day fallback when a weekday window is missing', async () => {
        // Sunday-only schedule: Wednesday (today, in the fake-timer setup) has no window.
        const wrapper = await mountWithUApp(OpeningHours, {
            openingHours: weekHours({ sunday: hours('10:00', '18:00') }),
        })

        const todayRow = wrapper.find('[data-today="true"]')
        expect(todayRow.exists()).toBe(true)
        expect(todayRow.text()).toContain('Closed')
    })

    it('Should render Dutch labels when the locale is nl', async () => {
        await setI18nLocale('nl')

        const wrapper = await mountWithUApp(OpeningHours, { openingHours: supermarketFixture.openingHours })

        expect(wrapper.text()).toContain('Openingstijden')
        expect(wrapper.text()).toContain('Vandaag')
    })
})
