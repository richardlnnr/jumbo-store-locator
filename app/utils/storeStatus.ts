import { addDays, getDay, isBefore, set } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

import type { JumboStore, StoreOpeningDay, StoreOpeningWindow } from '../../shared/types/store'
import type { StoreStatus, StoreStatusKey } from '../../shared/types/storeStatus'

const STORE_TIMEZONE = 'Europe/Amsterdam'

const WEEKDAYS_BY_DAY_INDEX: readonly StoreOpeningDay[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
]

function applyTime(base: Date, timeStr: string): Date {
    const [hour, minute] = timeStr.slice(0, 5).split(':').map(Number)
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
        throw new TypeError(`Invalid time string: ${timeStr}`)
    }
    return set(base, { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 })
}

function lookupWindow(store: Pick<JumboStore, 'openingHours'>, date: Date): StoreOpeningWindow | undefined {
    const day = WEEKDAYS_BY_DAY_INDEX[getDay(date)]
    if (!day) return undefined
    const window = store.openingHours[day]
    if (!window?.opensAt || !window?.closesAt) return undefined
    return window
}

export function getStoreStatus(store: Pick<JumboStore, 'openingHours'>, now: Date): StoreStatus {
    const wallclockNow = toZonedTime(now, STORE_TIMEZONE)
    const todayWindow = lookupWindow(store, wallclockNow)

    if (todayWindow) {
        const wallclockOpensAt = applyTime(wallclockNow, todayWindow.opensAt)
        const wallclockClosesAt = applyTime(wallclockNow, todayWindow.closesAt)

        if (!isBefore(wallclockNow, wallclockOpensAt) && isBefore(wallclockNow, wallclockClosesAt)) {
            return {
                isOpen: true,
                next: { key: 'status.closes-at', at: fromZonedTime(wallclockClosesAt, STORE_TIMEZONE) },
            }
        }
        if (isBefore(wallclockNow, wallclockOpensAt)) {
            return {
                isOpen: false,
                next: { key: 'status.opens-today-at', at: fromZonedTime(wallclockOpensAt, STORE_TIMEZONE) },
            }
        }
    }

    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
        const wallclockDay = addDays(wallclockNow, dayOffset)
        const upcomingWindow = lookupWindow(store, wallclockDay)
        if (upcomingWindow) {
            const key: StoreStatusKey = dayOffset === 1 ? 'status.opens-tomorrow-at' : 'status.opens-on'
            const wallclockOpensAt = applyTime(wallclockDay, upcomingWindow.opensAt)
            return {
                isOpen: false,
                next: { key, at: fromZonedTime(wallclockOpensAt, STORE_TIMEZONE) },
            }
        }
    }

    return { isOpen: false, next: null }
}
