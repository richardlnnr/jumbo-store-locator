import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { AMSTERDAM, amsterdamCentrumFeature } from '../../../shared/types/store.mock'
import { useUserLocationStore } from '../../stores/useUserLocationStore'
import { useStoreDistanceLabel } from './useStoreDistanceLabel'

describe('useStoreDistanceLabel', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('Should return null when the user has no shared location', () => {
        const distanceLabelFor = useStoreDistanceLabel()

        expect(distanceLabelFor(amsterdamCentrumFeature.properties.location)).toBeNull()
    })

    it('Should return a precise DistanceLabel when the source is precise', () => {
        useUserLocationStore().setPreciseLocation(AMSTERDAM)

        const distanceLabelFor = useStoreDistanceLabel()
        const label = distanceLabelFor(amsterdamCentrumFeature.properties.location)

        expect(label).not.toBeNull()
        expect(label).toMatchObject({
            key: expect.stringMatching(/^distance\.(km|m)$/),
            distance: expect.any(Number),
        })
    })

    it('Should return a coarse DistanceLabel with the approx key when the source is coarse', () => {
        useUserLocationStore().setCoarseLocation(AMSTERDAM)

        const distanceLabelFor = useStoreDistanceLabel()
        const label = distanceLabelFor(amsterdamCentrumFeature.properties.location)

        expect(label).not.toBeNull()
        expect(label?.key).toBe('distance.km-approx')
        expect(Number.isInteger(label?.distance)).toBe(true)
    })
})
