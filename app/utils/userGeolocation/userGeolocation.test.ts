import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Coordinate } from '../../../shared/types/store'
import { createFakeSessionStorage } from '../../../test-utils/createFakeSessionStorage'
import {
    classifyGeolocationError,
    clearLocationCache,
    getPrecisePosition,
    isValidLatitude,
    isValidLongitude,
    queryPermissionState,
    readLocationCache,
    writeLocationCache,
} from './userGeolocation'

const SESSION_STORAGE_KEY = 'jumbo-store-locator:user-location'
const PRECISE: Coordinate = { latitude: 52.3702, longitude: 4.8952 }

const buildPositionError = (code: number): GeolocationPositionError => ({
    code,
    message: '',
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
})

const buildPosition = (coordinate: Coordinate): GeolocationPosition => ({
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

beforeEach(() => {
    vi.stubGlobal('sessionStorage', createFakeSessionStorage())
})

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

describe('userGeolocation', () => {
    describe('isValidLatitude', () => {
        it('Should return true for finite values inside the [-90, 90] range', () => {
            expect(isValidLatitude(0)).toBe(true)
            expect(isValidLatitude(-90)).toBe(true)
            expect(isValidLatitude(90)).toBe(true)
            expect(isValidLatitude(51.9244)).toBe(true)
        })

        it('Should return false for values outside the [-90, 90] range', () => {
            expect(isValidLatitude(-90.1)).toBe(false)
            expect(isValidLatitude(90.1)).toBe(false)
            expect(isValidLatitude(999)).toBe(false)
        })

        it('Should return false for non-finite values', () => {
            expect(isValidLatitude(Number.NaN)).toBe(false)
            expect(isValidLatitude(Number.POSITIVE_INFINITY)).toBe(false)
            expect(isValidLatitude(Number.NEGATIVE_INFINITY)).toBe(false)
        })
    })

    describe('isValidLongitude', () => {
        it('Should return true for finite values inside the [-180, 180] range', () => {
            expect(isValidLongitude(0)).toBe(true)
            expect(isValidLongitude(-180)).toBe(true)
            expect(isValidLongitude(180)).toBe(true)
            expect(isValidLongitude(4.4777)).toBe(true)
        })

        it('Should return false for values outside the [-180, 180] range', () => {
            expect(isValidLongitude(-180.1)).toBe(false)
            expect(isValidLongitude(180.1)).toBe(false)
            expect(isValidLongitude(999)).toBe(false)
        })

        it('Should return false for non-finite values', () => {
            expect(isValidLongitude(Number.NaN)).toBe(false)
            expect(isValidLongitude(Number.POSITIVE_INFINITY)).toBe(false)
            expect(isValidLongitude(Number.NEGATIVE_INFINITY)).toBe(false)
        })
    })

    describe('readLocationCache', () => {
        it('Should return null when sessionStorage is undefined', () => {
            vi.stubGlobal('sessionStorage', undefined)

            expect(readLocationCache()).toBeNull()
        })

        it('Should return null when the cache key is missing', () => {
            expect(readLocationCache()).toBeNull()
        })

        it('Should return null when the stored payload is not valid JSON', () => {
            sessionStorage.setItem(SESSION_STORAGE_KEY, 'not-json')

            expect(readLocationCache()).toBeNull()
        })

        it('Should return null when savedAt is missing', () => {
            sessionStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify({ coordinate: PRECISE, source: 'precise' }),
            )

            expect(readLocationCache()).toBeNull()
        })

        it('Should return null when savedAt is not a number', () => {
            sessionStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify({ coordinate: PRECISE, source: 'precise', savedAt: 'yesterday' }),
            )

            expect(readLocationCache()).toBeNull()
        })

        it('Should return null when the entry is older than 30 minutes', () => {
            sessionStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify({
                    coordinate: PRECISE,
                    source: 'precise',
                    savedAt: Date.now() - 31 * 60 * 1000,
                }),
            )

            expect(readLocationCache()).toBeNull()
        })

        it('Should return null when savedAt is in the future (clock skew or poisoned cache)', () => {
            sessionStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify({
                    coordinate: PRECISE,
                    source: 'precise',
                    savedAt: Date.now() + 60 * 60 * 1000,
                }),
            )

            expect(readLocationCache()).toBeNull()
        })

        it('Should return null when source is neither precise nor coarse', () => {
            sessionStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify({ coordinate: PRECISE, source: 'guessed', savedAt: Date.now() }),
            )

            expect(readLocationCache()).toBeNull()
        })

        it('Should return null when the coordinate is missing', () => {
            sessionStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify({ source: 'precise', savedAt: Date.now() }),
            )

            expect(readLocationCache()).toBeNull()
        })

        it('Should return null when latitude is out of range', () => {
            sessionStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify({
                    coordinate: { latitude: 999, longitude: 4.4777 },
                    source: 'precise',
                    savedAt: Date.now(),
                }),
            )

            expect(readLocationCache()).toBeNull()
        })

        it('Should return null when longitude is out of range', () => {
            sessionStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify({
                    coordinate: { latitude: 51.9244, longitude: 999 },
                    source: 'precise',
                    savedAt: Date.now(),
                }),
            )

            expect(readLocationCache()).toBeNull()
        })

        it('Should return the cached payload when every field is valid', () => {
            const savedAt = Date.now() - 5 * 60 * 1000
            sessionStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify({ coordinate: PRECISE, source: 'precise', savedAt }),
            )

            expect(readLocationCache()).toEqual({
                coordinate: PRECISE,
                source: 'precise',
                savedAt,
            })
        })
    })

    describe('writeLocationCache', () => {
        it('Should serialise the coordinate, source, and a numeric savedAt to sessionStorage', () => {
            writeLocationCache(PRECISE, 'precise')

            const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
            expect(raw).not.toBeNull()
            const parsed = JSON.parse(raw as string)
            expect(parsed.coordinate).toEqual(PRECISE)
            expect(parsed.source).toBe('precise')
            expect(typeof parsed.savedAt).toBe('number')
        })

        it('Should be a no-op when sessionStorage is undefined', () => {
            vi.stubGlobal('sessionStorage', undefined)

            expect(() => writeLocationCache(PRECISE, 'coarse')).not.toThrow()
        })

        it('Should swallow setItem errors instead of propagating them', () => {
            vi.stubGlobal('sessionStorage', {
                getItem: () => null,
                setItem: () => {
                    throw new Error('quota exceeded')
                },
                removeItem: () => undefined,
                clear: () => undefined,
                length: 0,
                key: () => null,
            } as Storage)

            expect(() => writeLocationCache(PRECISE, 'coarse')).not.toThrow()
        })
    })

    describe('clearLocationCache', () => {
        it('Should remove the cache entry when one is present', () => {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ a: 1 }))

            clearLocationCache()

            expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
        })

        it('Should be a no-op when sessionStorage is undefined', () => {
            vi.stubGlobal('sessionStorage', undefined)

            expect(() => clearLocationCache()).not.toThrow()
        })

        it('Should swallow removeItem errors instead of propagating them', () => {
            vi.stubGlobal('sessionStorage', {
                getItem: () => null,
                setItem: () => undefined,
                removeItem: () => {
                    throw new Error('removal failed')
                },
                clear: () => undefined,
                length: 0,
                key: () => null,
            } as Storage)

            expect(() => clearLocationCache()).not.toThrow()
        })
    })

    describe('queryPermissionState', () => {
        it('Should resolve to unknown when navigator is undefined', async () => {
            vi.stubGlobal('navigator', undefined)

            await expect(queryPermissionState()).resolves.toBe('unknown')
        })

        it('Should resolve to unknown when navigator.permissions is missing', async () => {
            vi.stubGlobal('navigator', {})

            await expect(queryPermissionState()).resolves.toBe('unknown')
        })

        it('Should resolve to unknown when navigator.permissions.query is not a function', async () => {
            vi.stubGlobal('navigator', { permissions: { query: null } })

            await expect(queryPermissionState()).resolves.toBe('unknown')
        })

        it('Should resolve to granted when the underlying query returns granted', async () => {
            vi.stubGlobal('navigator', {
                permissions: { query: vi.fn(async () => ({ state: 'granted' } as PermissionStatus)) },
            })

            await expect(queryPermissionState()).resolves.toBe('granted')
        })

        it('Should resolve to denied when the underlying query returns denied', async () => {
            vi.stubGlobal('navigator', {
                permissions: { query: vi.fn(async () => ({ state: 'denied' } as PermissionStatus)) },
            })

            await expect(queryPermissionState()).resolves.toBe('denied')
        })

        it('Should resolve to prompt when the underlying query returns prompt', async () => {
            vi.stubGlobal('navigator', {
                permissions: { query: vi.fn(async () => ({ state: 'prompt' } as PermissionStatus)) },
            })

            await expect(queryPermissionState()).resolves.toBe('prompt')
        })

        it('Should resolve to unknown when the underlying query rejects', async () => {
            vi.stubGlobal('navigator', {
                permissions: {
                    query: vi.fn(async () => {
                        throw new Error('not supported')
                    }),
                },
            })

            await expect(queryPermissionState()).resolves.toBe('unknown')
        })
    })

    describe('classifyGeolocationError', () => {
        it('Should map code 1 to denied', () => {
            expect(classifyGeolocationError({ code: 1 })).toBe('denied')
        })

        it('Should map code 2 to unavailable', () => {
            expect(classifyGeolocationError({ code: 2 })).toBe('unavailable')
        })

        it('Should map code 3 to timeout', () => {
            expect(classifyGeolocationError({ code: 3 })).toBe('timeout')
        })

        it('Should fall back to unavailable for unknown numeric codes', () => {
            expect(classifyGeolocationError({ code: 99 })).toBe('unavailable')
        })

        it('Should fall back to unavailable for non-object inputs', () => {
            expect(classifyGeolocationError(null)).toBe('unavailable')
            expect(classifyGeolocationError('boom')).toBe('unavailable')
            expect(classifyGeolocationError(42)).toBe('unavailable')
        })

        it('Should fall back to unavailable when the object has no code property', () => {
            expect(classifyGeolocationError({ message: 'nope' })).toBe('unavailable')
        })
    })

    describe('getPrecisePosition', () => {
        it('Should reject with an unsupported error when navigator is undefined', async () => {
            vi.stubGlobal('navigator', undefined)

            await expect(getPrecisePosition()).rejects.toThrow('unsupported')
        })

        it('Should reject with an unsupported error when navigator.geolocation is missing', async () => {
            vi.stubGlobal('navigator', {})

            await expect(getPrecisePosition()).rejects.toThrow('unsupported')
        })

        it('Should resolve with the success-callback coordinate', async () => {
            const getCurrentPosition = vi.fn((success: PositionCallback): void => {
                success(buildPosition(PRECISE))
            })
            vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })

            await expect(getPrecisePosition()).resolves.toEqual(PRECISE)
        })

        it('Should reject with the raw GeolocationPositionError from the failure callback', async () => {
            const positionError = buildPositionError(1)
            const getCurrentPosition = vi.fn((
                _success: PositionCallback,
                failure: PositionErrorCallback | null | undefined,
            ): void => {
                failure?.(positionError)
            })
            vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })

            await expect(getPrecisePosition()).rejects.toBe(positionError)
        })

        it('Should request high accuracy with a 10 second timeout and zero cache', async () => {
            const getCurrentPosition = vi.fn((
                success: PositionCallback,
                _failure?: PositionErrorCallback | null,
                _options?: PositionOptions,
            ): void => {
                success(buildPosition(PRECISE))
            })
            vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })

            await getPrecisePosition()

            expect(getCurrentPosition).toHaveBeenCalledTimes(1)
            const [firstCall] = getCurrentPosition.mock.calls
            expect(firstCall?.[2]).toEqual({
                enableHighAccuracy: true,
                timeout: 10_000,
                maximumAge: 0,
            })
        })
    })
})
