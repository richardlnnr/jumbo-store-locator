import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { AMSTERDAM, amsterdamCentrumFeature } from '../../../shared/types/store.mock'
import { useStoreLocator } from '../../stores/useStoreLocator'
import { useStoreDistanceLabel } from './useStoreDistanceLabel'

describe('useStoreDistanceLabel', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('Should return null when the user has no shared location', () => {
        const distanceLabelFor = useStoreDistanceLabel()

        expect(distanceLabelFor(amsterdamCentrumFeature)).toBeNull()
    })

    it('Should return a DistanceLabel object when the user has shared a location', () => {
        const locator = useStoreLocator()
        locator.setUserLocation(AMSTERDAM)

        const distanceLabelFor = useStoreDistanceLabel()
        const label = distanceLabelFor(amsterdamCentrumFeature)

        expect(label).not.toBeNull()
        expect(label).toMatchObject({
            key: expect.stringMatching(/^distance\.(km|m)$/),
            distance: expect.any(Number),
        })
    })

    it('Should react to user location changes by returning new labels on subsequent calls', () => {
        const locator = useStoreLocator()
        const distanceLabelFor = useStoreDistanceLabel()

        expect(distanceLabelFor(amsterdamCentrumFeature)).toBeNull()

        locator.setUserLocation(AMSTERDAM)
        expect(distanceLabelFor(amsterdamCentrumFeature)).not.toBeNull()

        locator.setUserLocation(null)
        expect(distanceLabelFor(amsterdamCentrumFeature)).toBeNull()
    })
})
