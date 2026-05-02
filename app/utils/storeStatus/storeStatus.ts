import { addDays, differenceInCalendarDays, getDay, isBefore, set } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

import type { JumboStore, StoreOpeningDay, StoreOpeningWindow } from '../../../shared/types/store'
import type { StoreStatus, StoreStatusKey } from '../../../shared/types/storeStatus'

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

const resolveUserTimezone = (override?: string): string =>
    override ?? Intl.DateTimeFormat().resolvedOptions().timeZone

// "Today" / "tomorrow" / "on Monday" are user-facing labels and must reflect
// the user's calendar, not the store's. A user in Brazil at Friday 23:00
// (Amsterdam Saturday 04:00) should see "Opens tomorrow", because Saturday is
// tomorrow in their day, even though it is already today in Amsterdam. The
// "isOpen" check above continues to use Amsterdam wallclock because being open
// is a property of the store, not of the user.
const labelKeyForOpensAt = (now: Date, opensAt: Date, userTimezone: string): StoreStatusKey => {
    const localNow = toZonedTime(now, userTimezone)
    const localOpens = toZonedTime(opensAt, userTimezone)
    const dayDiff = differenceInCalendarDays(localOpens, localNow)
    if (dayDiff <= 0) return 'status.opens-today-at'
    if (dayDiff === 1) return 'status.opens-tomorrow-at'
    return 'status.opens-on'
}

export function getStoreStatus(
    store: Pick<JumboStore, 'openingHours'>,
    now: Date,
    userTimezone?: string,
): StoreStatus {
    const tz = resolveUserTimezone(userTimezone)
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
            const opensAt = fromZonedTime(wallclockOpensAt, STORE_TIMEZONE)
            return {
                isOpen: false,
                next: { key: labelKeyForOpensAt(now, opensAt, tz), at: opensAt },
            }
        }
    }

    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
        const wallclockDay = addDays(wallclockNow, dayOffset)
        const upcomingWindow = lookupWindow(store, wallclockDay)
        if (upcomingWindow) {
            const wallclockOpensAt = applyTime(wallclockDay, upcomingWindow.opensAt)
            const opensAt = fromZonedTime(wallclockOpensAt, STORE_TIMEZONE)
            return {
                isOpen: false,
                next: { key: labelKeyForOpensAt(now, opensAt, tz), at: opensAt },
            }
        }
    }

    return { isOpen: false, next: null }
}
