import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMapbox } from './useMapbox'

const mapboxMock = vi.hoisted(() => ({
    Map: vi.fn(),
    accessToken: '',
}))

vi.mock('mapbox-gl', () => ({
    default: mapboxMock,
}))

describe('useMapbox', () => {
    beforeEach(() => {
        mapboxMock.Map.mockReset()
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

    it('Should throw when the Mapbox access token is missing', async () => {
        useRuntimeConfig().public.mapboxToken = ''

        const { createMap } = useMapbox()

        await expect(createMap({ container: 'map' } as never))
            .rejects.toThrow(/NUXT_PUBLIC_MAPBOX_TOKEN/)
        expect(mapboxMock.Map).not.toHaveBeenCalled()
    })
})
