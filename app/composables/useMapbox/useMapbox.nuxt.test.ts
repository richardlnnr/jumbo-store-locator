import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMapbox } from './useMapbox'

type MapboxEventHandler = () => void

const loadHandlers = vi.hoisted(() => [] as MapboxEventHandler[])

const mapInstanceMock = vi.hoisted(() => ({
    remove: vi.fn(),
    on: vi.fn((event: string, handler: MapboxEventHandler) => {
        if (event === 'load') loadHandlers.push(handler)
    }),
}))

const mapboxMock = vi.hoisted(() => ({
    Map: vi.fn(function () {
        return mapInstanceMock
    }),
    accessToken: '',
}))

vi.mock('mapbox-gl', () => ({
    default: mapboxMock,
}))

const fireMapLoad = () => {
    for (const handler of loadHandlers) handler()
}

describe('useMapbox', () => {
    beforeEach(() => {
        mapboxMock.Map.mockClear()
        mapInstanceMock.remove.mockClear()
        mapInstanceMock.on.mockClear()
        loadHandlers.length = 0
        mapboxMock.accessToken = ''
        useRuntimeConfig().public.mapboxToken = 'pk.test'
    })

    it('Should create a Mapbox Map with the provided options and set the access token', async () => {
        const options = { container: 'map', style: 'mapbox://styles/mapbox/streets-v12' }

        const { createMap } = useMapbox()
        await createMap(options as never)

        expect(mapboxMock.Map).toHaveBeenCalledTimes(1)
        expect(mapboxMock.Map).toHaveBeenCalledWith(options)
        expect(mapboxMock.accessToken).toBe('pk.test')
    })

    it('Should remove the previous Mapbox Map when createMap is called again', async () => {
        const { createMap } = useMapbox()

        await createMap({ container: 'map' } as never)
        expect(mapInstanceMock.remove).not.toHaveBeenCalled()

        await createMap({ container: 'map' } as never)

        expect(mapInstanceMock.remove).toHaveBeenCalledTimes(1)
        expect(mapboxMock.Map).toHaveBeenCalledTimes(2)
    })

    it('Should throw when the Mapbox access token is missing', async () => {
        useRuntimeConfig().public.mapboxToken = ''

        const { createMap } = useMapbox()

        await expect(createMap({ container: 'map' } as never))
            .rejects.toThrow(/NUXT_PUBLIC_MAPBOX_TOKEN/)
        expect(mapboxMock.Map).not.toHaveBeenCalled()
    })

    it('Should expose isMapLoaded as false before the map fires load', async () => {
        const { createMap, isMapLoaded } = useMapbox()

        await createMap({ container: 'map' } as never)

        expect(isMapLoaded.value).toBe(false)
        expect(mapInstanceMock.on).toHaveBeenCalledWith('load', expect.any(Function))
    })

    it('Should flip isMapLoaded to true once the Mapbox load event fires', async () => {
        const { createMap, isMapLoaded } = useMapbox()

        await createMap({ container: 'map' } as never)
        fireMapLoad()

        expect(isMapLoaded.value).toBe(true)
    })

    it('Should reset isMapLoaded to false when createMap is called again', async () => {
        const { createMap, isMapLoaded } = useMapbox()

        await createMap({ container: 'map' } as never)
        fireMapLoad()
        expect(isMapLoaded.value).toBe(true)

        await createMap({ container: 'map' } as never)

        expect(isMapLoaded.value).toBe(false)
    })
})
