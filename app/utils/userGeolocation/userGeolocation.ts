import type { Coordinate } from '../../../shared/types/store'
import type {
    PermissionState,
    UserLocationError,
} from '../../../shared/types/userGeolocation'

export type CachedSource = 'precise' | 'coarse'

export interface CachedLocation {
    coordinate: Coordinate
    source: CachedSource
    savedAt: number
}

const SESSION_STORAGE_KEY = 'jumbo-store-locator:user-location'
const SESSION_TTL_MS = 30 * 60 * 1000
const PRECISE_TIMEOUT_MS = 10_000

export const isValidLatitude = (value: number): boolean =>
    Number.isFinite(value) && value >= -90 && value <= 90

export const isValidLongitude = (value: number): boolean =>
    Number.isFinite(value) && value >= -180 && value <= 180

export const readLocationCache = (): CachedLocation | null => {
    if (typeof sessionStorage === 'undefined') return null
    try {
        const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as Partial<CachedLocation>
        if (typeof parsed.savedAt !== 'number') return null
        const elapsed = Date.now() - parsed.savedAt
        if (elapsed < 0 || elapsed > SESSION_TTL_MS) return null
        if (parsed.source !== 'precise' && parsed.source !== 'coarse') return null
        const coordinate = parsed.coordinate
        if (!coordinate
            || !isValidLatitude(coordinate.latitude)
            || !isValidLongitude(coordinate.longitude)) return null
        return { coordinate, source: parsed.source, savedAt: parsed.savedAt }
    }
    catch {
        return null
    }
}

export const writeLocationCache = (coordinate: Coordinate, source: CachedSource): void => {
    if (typeof sessionStorage === 'undefined') return
    try {
        sessionStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify({ coordinate, source, savedAt: Date.now() }),
        )
    }
    catch {
        // intentionally swallowed
    }
}

export const clearLocationCache = (): void => {
    if (typeof sessionStorage === 'undefined') return
    try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY)
    }
    catch {
        // intentionally swallowed
    }
}

export const queryPermissionState = async (): Promise<PermissionState> => {
    if (typeof navigator === 'undefined'
        || !navigator.permissions
        || typeof navigator.permissions.query !== 'function') {
        return 'unknown'
    }
    try {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        if (result.state === 'granted') return 'granted'
        if (result.state === 'denied') return 'denied'
        return 'prompt'
    }
    catch {
        return 'unknown'
    }
}

export const classifyGeolocationError = (raw: unknown): UserLocationError => {
    if (typeof raw === 'object' && raw !== null && 'code' in raw) {
        const code = (raw as { code: unknown }).code
        if (code === 1) return 'denied'
        if (code === 2) return 'unavailable'
        if (code === 3) return 'timeout'
    }
    return 'unavailable'
}

export const getPrecisePosition = (): Promise<Coordinate> =>
    new Promise((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            reject(new Error('unsupported'))
            return
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                })
            },
            (geolocationError) => {
                reject(geolocationError)
            },
            { enableHighAccuracy: true, timeout: PRECISE_TIMEOUT_MS, maximumAge: 0 },
        )
    })
