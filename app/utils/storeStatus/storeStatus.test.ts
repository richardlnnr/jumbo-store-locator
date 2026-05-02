import { describe, expect, it } from 'vitest'

import enLocale from '../../../i18n/locales/en.json'
import nlLocale from '../../../i18n/locales/nl.json'

import { buildStore, everyDay, hours, openEveryDayStore, weekHours } from '../../../shared/types/store.mock'
import { getStoreStatus } from './storeStatus'

const tuesday = (hour: number, minute = 0, second = 0) => new Date(2025, 0, 7, hour, minute, second)
const wednesday = (hour: number, minute = 0, second = 0) => new Date(2025, 0, 8, hour, minute, second)
const saturday = (hour: number, minute = 0, second = 0) => new Date(2025, 0, 11, hour, minute, second)
const monday = (hour: number, minute = 0, second = 0) => new Date(2025, 0, 13, hour, minute, second)

describe('getStoreStatus', () => {
    it('Should report open with the closing time when now is inside today\'s window', () => {
        const status = getStoreStatus(openEveryDayStore, tuesday(14))

        expect(status.isOpen).toBe(true)
        expect(status.next).toEqual({
            key: 'status.closes-at',
            at: tuesday(22),
        })
    })

    it('Should report closed with today\'s opening time when now is before opens-at', () => {
        const status = getStoreStatus(openEveryDayStore, tuesday(6))

        expect(status.isOpen).toBe(false)
        expect(status.next).toEqual({
            key: 'status.opens-today-at',
            at: tuesday(8),
        })
    })

    it('Should report closed with tomorrow\'s opening time when today\'s window has already ended', () => {
        const status = getStoreStatus(openEveryDayStore, tuesday(23, 30))

        expect(status.isOpen).toBe(false)
        expect(status.next).toEqual({
            key: 'status.opens-tomorrow-at',
            at: wednesday(8),
        })
    })

    it('Should skip closed days and return opens-on with the next available weekday', () => {
        const store = buildStore(weekHours({
            saturday: hours('08:00', '11:00'),
            monday: hours('08:00', '22:00'),
        }))

        const status = getStoreStatus(store, saturday(12))

        expect(status.isOpen).toBe(false)
        expect(status.next).toEqual({
            key: 'status.opens-on',
            at: monday(8),
        })
    })

    it('Should return next=null when the store has no opening hours for any weekday', () => {
        const store = buildStore(weekHours({}))

        const status = getStoreStatus(store, tuesday(14))

        expect(status.isOpen).toBe(false)
        expect(status.next).toBeNull()
    })

    it('Should treat the last second of the day as closed and point to tomorrow\'s opening', () => {
        const status = getStoreStatus(openEveryDayStore, tuesday(23, 59, 59))

        expect(status.isOpen).toBe(false)
        expect(status.next).toEqual({
            key: 'status.opens-tomorrow-at',
            at: wednesday(8),
        })
    })

    it('Should consider the store open at the exact opening minute (inclusive boundary)', () => {
        const status = getStoreStatus(openEveryDayStore, tuesday(8, 0, 0))

        expect(status.isOpen).toBe(true)
        expect(status.next?.key).toBe('status.closes-at')
    })

    it('Should consider the store closed at the exact closing minute (exclusive boundary)', () => {
        const status = getStoreStatus(openEveryDayStore, tuesday(22, 0, 0))

        expect(status.isOpen).toBe(false)
        expect(status.next).toEqual({
            key: 'status.opens-tomorrow-at',
            at: wednesday(8),
        })
    })

    it('Should only return translation keys that exist in every supported locale', () => {
        const possibleKeys = [
            'status.closes-at',
            'status.opens-today-at',
            'status.opens-tomorrow-at',
            'status.opens-on',
        ] as const

        for (const fullKey of possibleKeys) {
            const suffix = fullKey.replace(/^status\./, '')
            expect(enLocale.status).toHaveProperty(suffix)
            expect(nlLocale.status).toHaveProperty(suffix)
        }
    })

    it('Should resolve UTC instants regardless of input Date construction (winter)', () => {
        const status = getStoreStatus(openEveryDayStore, new Date('2025-01-07T19:00:00Z'))

        expect(status.isOpen).toBe(true)
        expect(status.next?.key).toBe('status.closes-at')
        expect(status.next?.at.toISOString()).toBe('2025-01-07T21:00:00.000Z')
    })

    it('Should respect Amsterdam DST when computing the next event (summer)', () => {
        const status = getStoreStatus(openEveryDayStore, new Date('2025-07-01T18:00:00Z'))

        expect(status.isOpen).toBe(true)
        expect(status.next?.key).toBe('status.closes-at')
        expect(status.next?.at.toISOString()).toBe('2025-07-01T20:00:00.000Z')
    })

    it('Should treat an empty window for today as a closed day and roll forward', () => {
        const store = buildStore({
            ...weekHours({ wednesday: hours('08:00', '22:00') }),
            tuesday: {} as never,
        })

        const status = getStoreStatus(store, tuesday(14))

        expect(status.isOpen).toBe(false)
        expect(status.next).toEqual({
            key: 'status.opens-tomorrow-at',
            at: wednesday(8),
        })
    })

    it('Should treat a window missing opensAt or closesAt as a closed day', () => {
        const store = buildStore({
            ...weekHours({ wednesday: hours('08:00', '22:00') }),
            tuesday: { closesAt: '00:01+01:00' } as never,
        })

        const status = getStoreStatus(store, tuesday(14))

        expect(status.isOpen).toBe(false)
        expect(status.next?.key).toBe('status.opens-tomorrow-at')
    })

    it('Should throw a TypeError when openingHours contains a malformed time string', () => {
        const store = buildStore(everyDay(hours('not-a-time', '22:00')))

        expect(() => getStoreStatus(store, tuesday(14))).toThrow(TypeError)
    })

    it('Should label the next opening as opens-tomorrow-at when the store rolls into a new day in Amsterdam but is still on the previous day in the user timezone', () => {
        // Saturday 04:00 Amsterdam (UTC 02:00) is still Friday 23:00 in Sao Paulo.
        // The store opens Saturday 08:00 Amsterdam = Saturday 03:00 Sao Paulo.
        // From the user's calendar perspective, that is "tomorrow", not "today".
        const now = new Date('2025-01-11T02:00:00Z')

        const status = getStoreStatus(openEveryDayStore, now, 'America/Sao_Paulo')

        expect(status.isOpen).toBe(false)
        expect(status.next?.key).toBe('status.opens-tomorrow-at')
        expect(status.next?.at.toISOString()).toBe('2025-01-11T07:00:00.000Z')
    })

    it('Should label the next opening as opens-today-at when both the user timezone and Amsterdam are still on the same day before opens-at', () => {
        // Saturday 06:00 Amsterdam (UTC 05:00) is Saturday 02:00 Sao Paulo —
        // still the same calendar day in both timezones, so it stays "today".
        const now = new Date('2025-01-11T05:00:00Z')

        const status = getStoreStatus(openEveryDayStore, now, 'America/Sao_Paulo')

        expect(status.isOpen).toBe(false)
        expect(status.next?.key).toBe('status.opens-today-at')
    })
})
