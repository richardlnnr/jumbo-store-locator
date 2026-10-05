import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { Coordinate } from '../../shared/types/store'
import type {
    PermissionState,
    UserLocationError,
    UserLocationSource,
    UserLocationState,
} from '../../shared/types/userGeolocation'
import {
    classifyGeolocationError,
    clearLocationCache,
    getPrecisePosition,
    isValidLatitude,
    isValidLongitude,
    queryPermissionState,
    readLocationCache,
    writeLocationCache,
} from '../utils/userGeolocation/userGeolocation'

const COARSE_TIMEOUT_MS = 5_000
const COARSE_ENDPOINT = 'https://get.geojs.io/v1/ip/geo.json'

const fetchCoarsePosition = async (signal: AbortSignal): Promise<Coordinate | null> => {
    if (typeof fetch === 'undefined') return null
    try {
        const response = await fetch(COARSE_ENDPOINT, {
            credentials: 'omit',
            signal,
        })
        if (!response.ok) return null
        const payload = (await response.json()) as { latitude?: unknown, longitude?: unknown }
        const latitude = Number(payload.latitude)
        const longitude = Number(payload.longitude)
        if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) return null
        return { latitude, longitude }
    }
    catch {
        return null
    }
}

export const useUserLocationStore = defineStore('userLocation', () => {
    const coordinate = ref<Coordinate | null>(null)
    const source = ref<UserLocationSource>(null)
    const state = ref<UserLocationState>('idle')
    const error = ref<UserLocationError | null>(null)
    const permissionState = ref<PermissionState>('unknown')
    const bannerDismissed = ref(false)

    let generation = 0
    let activeAbort: AbortController | null = null

    const cancelInFlight = (): number => {
        activeAbort?.abort()
        activeAbort = null
        generation += 1
        return generation
    }

    const setPreciseLocation = (next: Coordinate): void => {
        coordinate.value = next
        source.value = 'precise'
        state.value = 'ready'
        error.value = null
        permissionState.value = 'granted'
        writeLocationCache(next, 'precise')
    }

    const setCoarseLocation = (next: Coordinate): void => {
        if (source.value === 'precise') return
        coordinate.value = next
        source.value = 'coarse'
        state.value = 'ready'
        writeLocationCache(next, 'coarse')
    }

    const clearUserLocation = (): void => {
        cancelInFlight()
        coordinate.value = null
        source.value = null
        state.value = 'idle'
        error.value = null
        clearLocationCache()
    }

    const $resetForTests = (): void => {
        cancelInFlight()
        coordinate.value = null
        source.value = null
        state.value = 'idle'
        error.value = null
        permissionState.value = 'unknown'
        bannerDismissed.value = false
    }

    const dismissBanner = (): void => {
        cancelInFlight()
        bannerDismissed.value = true
    }

    const runCoarseFallback = async (gen: number): Promise<void> => {
        activeAbort = new AbortController()
        const timer = setTimeout(() => activeAbort?.abort(), COARSE_TIMEOUT_MS)
        let next: Coordinate | null = null
        try {
            next = await fetchCoarsePosition(activeAbort.signal)
        }
        finally {
            clearTimeout(timer)
        }
        if (gen !== generation) return
        if (next) setCoarseLocation(next)
        if (source.value === null) {
            state.value = 'error'
            if (error.value === null) error.value = 'coarse-failed'
        }
    }

    const fallbackToCoarse = async (): Promise<void> => {
        const gen = cancelInFlight()
        await runCoarseFallback(gen)
    }

    const requestPrecise = async (): Promise<void> => {
        const gen = cancelInFlight()
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            permissionState.value = 'unsupported'
            error.value = 'unsupported'
            await runCoarseFallback(gen)
            return
        }
        state.value = 'loading'
        error.value = null
        try {
            const next = await getPrecisePosition()
            if (gen !== generation) return
            setPreciseLocation(next)
        }
        catch (raw) {
            if (gen !== generation) return
            const classified = classifyGeolocationError(raw)
            error.value = classified
            if (classified === 'denied') permissionState.value = 'denied'
            await runCoarseFallback(gen)
        }
    }

    const refreshLocation = async (): Promise<void> => {
        clearLocationCache()
        await requestPrecise()
    }

    const initialize = async (): Promise<void> => {
        const gen = cancelInFlight()
        state.value = 'loading'

        const cached = readLocationCache()
        if (cached) {
            const granted = await queryPermissionState()
            if (gen !== generation) return
            if (cached.source === 'precise') {
                if (granted === 'denied' || granted === 'unsupported') {
                    clearLocationCache()
                    permissionState.value = granted
                    error.value = granted === 'denied' ? 'denied' : 'unsupported'
                    await runCoarseFallback(gen)
                    return
                }
                permissionState.value = granted === 'unknown' ? 'granted' : granted
                coordinate.value = cached.coordinate
                source.value = 'precise'
                state.value = 'ready'
                error.value = null
                return
            }
            permissionState.value = granted
            coordinate.value = cached.coordinate
            source.value = 'coarse'
            state.value = 'ready'
            return
        }

        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            permissionState.value = 'unsupported'
            error.value = 'unsupported'
            await runCoarseFallback(gen)
            return
        }

        const granted = await queryPermissionState()
        if (gen !== generation) return
        permissionState.value = granted

        if (granted === 'granted') {
            try {
                const next = await getPrecisePosition()
                if (gen !== generation) return
                setPreciseLocation(next)
            }
            catch (raw) {
                if (gen !== generation) return
                const classified = classifyGeolocationError(raw)
                error.value = classified
                await runCoarseFallback(gen)
            }
            return
        }

        if (granted === 'denied') {
            error.value = 'denied'
            await runCoarseFallback(gen)
            return
        }

        await runCoarseFallback(gen)
    }

    const isPrecise = computed(() => source.value === 'precise')

    return {
        coordinate,
        source,
        state,
        error,
        permissionState,
        bannerDismissed,
        isPrecise,
        setPreciseLocation,
        setCoarseLocation,
        clearUserLocation,
        $resetForTests,
        dismissBanner,
        initialize,
        requestPrecise,
        refreshLocation,
        fallbackToCoarse,
    }
})
