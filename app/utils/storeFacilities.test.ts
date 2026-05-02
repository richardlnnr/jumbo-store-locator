import { describe, expect, it } from 'vitest'

import type { StoreFacilities } from '../../shared/types/store'
import { getStoreFacilityChips } from './storeFacilities'

const baseFacilities: StoreFacilities = {
    cookingStudio: false,
    dryCleaning: false,
    flowers: false,
    kitchen: false,
    liquorService: false,
    locationType: 'SUPERMARKET',
    parking: 'NO_INFO',
    pharmacy: false,
    photoService: false,
    pickUpType: 'NONE',
    postOffice: false,
    selfCheckout: false,
    selfScan: false,
    wifi: false,
}

describe('getStoreFacilityChips', () => {
    it('Should return an empty list when no facilities are present', () => {
        expect(getStoreFacilityChips(baseFacilities)).toEqual([])
    })

    it('Should produce one i18n key per truthy boolean facility flag', () => {
        const chips = getStoreFacilityChips({
            ...baseFacilities,
            selfScan: true,
            pharmacy: true,
            wifi: true,
        })

        expect(chips).toContain('facilities.selfScan')
        expect(chips).toContain('facilities.pharmacy')
        expect(chips).toContain('facilities.wifi')
        expect(chips).toHaveLength(3)
    })

    it('Should map each parking variant to its own chip and produce no chip for NO_INFO', () => {
        expect(getStoreFacilityChips({ ...baseFacilities, parking: 'FREE' }))
            .toEqual(['facilities.parking.free'])
        expect(getStoreFacilityChips({ ...baseFacilities, parking: 'PAID' }))
            .toEqual(['facilities.parking.paid'])
        expect(getStoreFacilityChips({ ...baseFacilities, parking: 'ZONE' }))
            .toEqual(['facilities.parking.zone'])
        expect(getStoreFacilityChips({ ...baseFacilities, parking: 'NO_INFO' })).toEqual([])
    })

    it('Should map each pickup variant to its own chip and produce no chip for NONE', () => {
        expect(getStoreFacilityChips({ ...baseFacilities, pickUpType: 'INSIDE' }))
            .toEqual(['facilities.pickUpType.inside'])
        expect(getStoreFacilityChips({ ...baseFacilities, pickUpType: 'OUTSIDE' }))
            .toEqual(['facilities.pickUpType.outside'])
        expect(getStoreFacilityChips({ ...baseFacilities, pickUpType: 'NONE' })).toEqual([])
    })

    it('Should never emit a chip for the locationType property', () => {
        const chips = getStoreFacilityChips({ ...baseFacilities, locationType: 'SUPERMARKET' })

        expect(chips.some(key => key.startsWith('facilities.locationType'))).toBe(false)
    })
})
