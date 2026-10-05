import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { Coordinate } from '../../shared/types/store'
import { createFakeSessionStorage } from '../../test-utils/createFakeSessionStorage'
import { useUserLocationStore } from './useUserLocationStore'

const PRECISE: Coordinate = { latitude: 52.3702, longitude: 4.8952 }
const COARSE_PAYLOAD = {
    latitude: '51.9244',
    longitude: '4.4777',
    city: 'Rotterdam',
    country: 'Netherlands',
}
const FOREIGN_PAYLOAD = {
    latitude: '48.8566',
    longitude: '2.3522',
    city: 'Paris',
    country: 'France',
}

type DomPermissionState = 'granted' | 'denied' | 'prompt'

const buildPermissions = (initialState: DomPermissionState | 'throw') => ({
    query: vi.fn(async ({ name: _name }: { name: PermissionName }) => {
        if (initialState === 'throw') throw new Error('permission query unsupported')
        return { state: initialState } as PermissionStatus
    }),
})

const buildGeolocation = (
    response:
        | { kind: 'success', coordinate: Coordinate }
        | { kind: 'error', code: number },
) => ({
    getCurrentPosition: vi.fn((
        success: PositionCallback,
        failure: PositionErrorCallback | null | undefined,
    ): void => {
        if (response.kind === 'success') {
            success({
                coords: {
                    latitude: response.coordinate.latitude,
                    longitude: response.coordinate.longitude,
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
            return
        }
        failure?.({ code: response.code, message: '', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError)
    }),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
})

const buildFetchOk = (payload: unknown) =>
    vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => payload,
    } as unknown as Response))

const buildFetchHttpError = () =>
    vi.fn(async () => ({
        ok: false,
        status: 500,
        json: async () => ({}),
    } as unknown as Response))

const buildFetchRejection = () => vi.fn(async () => {
    throw new Error('network failure')
})

beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('sessionStorage', createFakeSessionStorage())
})

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

describe('useUserLocationStore', () => {
    describe('initialize - cache hit', () => {
        it('Should hydrate the precise coordinate from cache without any geolocation or fetch call', async () => {
            sessionStorage.setItem(
                'jumbo-store-locator:user-location',
                JSON.stringify({ coordinate: PRECISE, source: 'precise', savedAt: Date.now() }),
            )
            const geolocation = buildGeolocation({ kind: 'error', code: 2 })
            const fetchSpy = buildFetchRejection()
            vi.stubGlobal('navigator', { geolocation, permissions: buildPermissions('granted') })
            vi.stubGlobal('fetch', fetchSpy)
            const store = useUserLocationStore()

            await store.initialize()

            expect(geolocation.getCurrentPosition).not.toHaveBeenCalled()
            expect(fetchSpy).not.toHaveBeenCalled()
            expect(store.coordinate).toEqual(PRECISE)
            expect(store.source).toBe('precise')
            expect(store.state).toBe('ready')
        })

        it('Should drop a stale precise cache and fall back to coarse when permission is now denied', async () => {
            sessionStorage.setItem(
                'jumbo-store-locator:user-location',
                JSON.stringify({ coordinate: PRECISE, source: 'precise', savedAt: Date.now() }),
            )
            const geolocation = buildGeolocation({ kind: 'error', code: 1 })
            const fetchSpy = buildFetchOk(COARSE_PAYLOAD)
            vi.stubGlobal('navigator', { geolocation, permissions: buildPermissions('denied') })
            vi.stubGlobal('fetch', fetchSpy)
            const store = useUserLocationStore()

            await store.initialize()

            expect(store.permissionState).toBe('denied')
            expect(store.error).toBe('denied')
            expect(store.source).toBe('coarse')
            expect(geolocation.getCurrentPosition).not.toHaveBeenCalled()
        })
    })

    describe('initialize - permission state', () => {
        it('Should silently call getCurrentPosition when permission is already granted', async () => {
            const geolocation = buildGeolocation({ kind: 'success', coordinate: PRECISE })
            const fetchSpy = buildFetchOk(COARSE_PAYLOAD)
            vi.stubGlobal('navigator', { geolocation, permissions: buildPermissions('granted') })
            vi.stubGlobal('fetch', fetchSpy)
            const store = useUserLocationStore()

            await store.initialize()

            expect(geolocation.getCurrentPosition).toHaveBeenCalledTimes(1)
            expect(fetchSpy).not.toHaveBeenCalled()
            expect(store.state).toBe('ready')
            expect(store.permissionState).toBe('granted')
            expect(store.error).toBeNull()
        })

        it('Should fall back to coarse and not call getCurrentPosition when permission is denied', async () => {
            const geolocation = buildGeolocation({ kind: 'error', code: 1 })
            const fetchSpy = buildFetchOk(COARSE_PAYLOAD)
            vi.stubGlobal('navigator', { geolocation, permissions: buildPermissions('denied') })
            vi.stubGlobal('fetch', fetchSpy)
            const store = useUserLocationStore()

            await store.initialize()

            expect(geolocation.getCurrentPosition).not.toHaveBeenCalled()
            expect(fetchSpy).toHaveBeenCalledTimes(1)
            expect(store.permissionState).toBe('denied')
            expect(store.error).toBe('denied')
            expect(store.state).toBe('ready')
        })

        it('Should fall back to coarse without calling getCurrentPosition when permission is prompt', async () => {
            const geolocation = buildGeolocation({ kind: 'error', code: 1 })
            const fetchSpy = buildFetchOk(COARSE_PAYLOAD)
            vi.stubGlobal('navigator', { geolocation, permissions: buildPermissions('prompt') })
            vi.stubGlobal('fetch', fetchSpy)
            const store = useUserLocationStore()

            await store.initialize()

            expect(geolocation.getCurrentPosition).not.toHaveBeenCalled()
            expect(fetchSpy).toHaveBeenCalledTimes(1)
            expect(store.permissionState).toBe('prompt')
            expect(store.error).toBeNull()
            expect(store.state).toBe('ready')
        })

        it('Should mark permissionState as unsupported when navigator.geolocation is missing', async () => {
            vi.stubGlobal('navigator', { permissions: buildPermissions('granted') })
            vi.stubGlobal('fetch', buildFetchOk(COARSE_PAYLOAD))
            const store = useUserLocationStore()

            await store.initialize()

            expect(store.permissionState).toBe('unsupported')
            expect(store.error).toBe('unsupported')
        })
    })

    describe('coarse fallback', () => {
        it('Should write coarse coordinates after parsing string lat/lng inside NL', async () => {
            const geolocation = buildGeolocation({ kind: 'error', code: 1 })
            vi.stubGlobal('navigator', { geolocation, permissions: buildPermissions('prompt') })
            vi.stubGlobal('fetch', buildFetchOk(COARSE_PAYLOAD))
            const store = useUserLocationStore()

            await store.initialize()

            expect(store.coordinate).toEqual({ latitude: 51.9244, longitude: 4.4777 })
            expect(store.source).toBe('coarse')
        })

        it('Should accept a coarse coordinate even when it lands outside the Netherlands', async () => {
            const geolocation = buildGeolocation({ kind: 'error', code: 1 })
            vi.stubGlobal('navigator', { geolocation, permissions: buildPermissions('prompt') })
            vi.stubGlobal('fetch', buildFetchOk(FOREIGN_PAYLOAD))
            const store = useUserLocationStore()

            await store.initialize()

            expect(store.coordinate).toEqual({ latitude: 48.8566, longitude: 2.3522 })
            expect(store.source).toBe('coarse')
            expect(store.state).toBe('ready')
        })

        it('Should mark error as coarse-failed when geojs.io returns a non-2xx status', async () => {
            const geolocation = buildGeolocation({ kind: 'error', code: 1 })
            vi.stubGlobal('navigator', { geolocation, permissions: buildPermissions('prompt') })
            vi.stubGlobal('fetch', buildFetchHttpError())
            const store = useUserLocationStore()

            await store.initialize()

            expect(store.error).toBe('coarse-failed')
            expect(store.state).toBe('error')
        })

        it('Should advance state to error when both precise and coarse fail under granted permission', async () => {
            const geolocation = buildGeolocation({ kind: 'error', code: 3 })
            vi.stubGlobal('navigator', { geolocation, permissions: buildPermissions('granted') })
            vi.stubGlobal('fetch', buildFetchRejection())
            const store = useUserLocationStore()

            await store.initialize()

            expect(store.state).toBe('error')
            expect(store.error).toBe('timeout')
            expect(store.coordinate).toBeNull()
        })
    })

    describe('requestPrecise', () => {
        it('Should write precise to the store and clear any prior error on success', async () => {
            const geolocation = buildGeolocation({ kind: 'success', coordinate: PRECISE })
            vi.stubGlobal('navigator', { geolocation, permissions: buildPermissions('prompt') })
            vi.stubGlobal('fetch', buildFetchOk(COARSE_PAYLOAD))
            const store = useUserLocationStore()

            await store.requestPrecise()

            expect(store.coordinate).toEqual(PRECISE)
            expect(store.source).toBe('precise')
            expect(store.state).toBe('ready')
            expect(store.error).toBeNull()
            expect(store.permissionState).toBe('granted')
        })

        it('Should fall back to coarse when the user denies the precise prompt', async () => {
            const geolocation = buildGeolocation({ kind: 'error', code: 1 })
            vi.stubGlobal('navigator', { geolocation, permissions: buildPermissions('prompt') })
            vi.stubGlobal('fetch', buildFetchOk(COARSE_PAYLOAD))
            const store = useUserLocationStore()

            await store.requestPrecise()

            expect(store.source).toBe('coarse')
            expect(store.error).toBe('denied')
            expect(store.permissionState).toBe('denied')
            expect(store.state).toBe('ready')
        })
    })

    describe('source guard', () => {
        it('Should refuse to overwrite a precise coordinate via setCoarseLocation', () => {
            const store = useUserLocationStore()
            store.setPreciseLocation(PRECISE)

            store.setCoarseLocation({ latitude: 51.9244, longitude: 4.4777 })

            expect(store.coordinate).toEqual(PRECISE)
            expect(store.source).toBe('precise')
        })

        it('Should let setPreciseLocation upgrade an existing coarse source', () => {
            const store = useUserLocationStore()
            store.setCoarseLocation({ latitude: 51.9244, longitude: 4.4777 })

            store.setPreciseLocation(PRECISE)

            expect(store.coordinate).toEqual(PRECISE)
            expect(store.source).toBe('precise')
        })

        it('Should accept a foreign coarse coordinate as the user location', () => {
            const store = useUserLocationStore()

            store.setCoarseLocation({ latitude: 48.8566, longitude: 2.3522 })

            expect(store.coordinate).toEqual({ latitude: 48.8566, longitude: 2.3522 })
            expect(store.source).toBe('coarse')
        })
    })

    describe('refreshLocation', () => {
        it('Should bypass the sessionStorage cache and call getCurrentPosition again', async () => {
            sessionStorage.setItem(
                'jumbo-store-locator:user-location',
                JSON.stringify({ coordinate: PRECISE, source: 'precise', savedAt: Date.now() }),
            )
            const newPrecise: Coordinate = { latitude: 53.0, longitude: 5.0 }
            const geolocation = buildGeolocation({ kind: 'success', coordinate: newPrecise })
            vi.stubGlobal('navigator', { geolocation, permissions: buildPermissions('granted') })
            vi.stubGlobal('fetch', buildFetchOk(COARSE_PAYLOAD))
            const store = useUserLocationStore()

            await store.refreshLocation()

            expect(store.coordinate).toEqual(newPrecise)
            expect(geolocation.getCurrentPosition).toHaveBeenCalledTimes(1)
        })
    })

    describe('dismissBanner', () => {
        it('Should flip bannerDismissed to true', () => {
            const store = useUserLocationStore()

            store.dismissBanner()

            expect(store.bannerDismissed).toBe(true)
        })
    })

    describe('clearUserLocation', () => {
        it('Should reset the coordinate, source, state, and error but leave permissionState alone', () => {
            const store = useUserLocationStore()
            store.setPreciseLocation(PRECISE)

            store.clearUserLocation()

            expect(store.coordinate).toBeNull()
            expect(store.source).toBeNull()
            expect(store.state).toBe('idle')
            expect(store.error).toBeNull()
            expect(store.permissionState).toBe('granted')
        })
    })

    describe('in-flight race protection', () => {
        it('Should not resurrect a coordinate after dismissBanner aborts the in-flight coarse fetch', async () => {
            let resolveFetch: (value: Response) => void = () => {}
            const fetchSpy = vi.fn((_url: string, init?: { signal?: AbortSignal }) => {
                init?.signal?.addEventListener('abort', () => {
                    resolveFetch({ ok: false, status: 0, json: async () => ({}) } as Response)
                })
                return new Promise<Response>((resolve) => {
                    resolveFetch = resolve
                })
            })
            const geolocation = buildGeolocation({ kind: 'error', code: 1 })
            vi.stubGlobal('navigator', { geolocation, permissions: buildPermissions('prompt') })
            vi.stubGlobal('fetch', fetchSpy)
            const store = useUserLocationStore()

            const initPromise = store.initialize()
            store.dismissBanner()
            await initPromise

            expect(store.coordinate).toBeNull()
            expect(store.source).toBeNull()
        })
    })
})
