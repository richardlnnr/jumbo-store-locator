import { beforeEach, describe, expect, it } from 'vitest'

import type { StoreFacilities } from '~~/shared/types/store'
import { supermarketFixture } from '~~/shared/types/store.mock'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'

import FacilitiesList from './FacilitiesList.vue'

const noFacilities: StoreFacilities = {
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

describe('StorePopupFacilitiesList', () => {
    beforeEach(async () => {
        await setI18nLocale('en')
    })

    it('Should render a chip for every truthy facility flag with its localized label', async () => {
        const wrapper = await mountWithUApp(FacilitiesList, { facilities: supermarketFixture.facilities })

        expect(wrapper.text()).toContain('Facilities')
        expect(wrapper.text()).toContain('Free parking')
        expect(wrapper.text()).toContain('Flowers')
        expect(wrapper.text()).toContain('Wi-Fi')
    })

    it('Should render nothing when no chips would be produced', async () => {
        const wrapper = await mountWithUApp(FacilitiesList, { facilities: noFacilities })

        expect(wrapper.text()).not.toContain('Facilities')
    })

    it('Should render Dutch chip labels when the locale is nl', async () => {
        await setI18nLocale('nl')

        const wrapper = await mountWithUApp(FacilitiesList, { facilities: supermarketFixture.facilities })

        expect(wrapper.text()).toContain('Voorzieningen')
        expect(wrapper.text()).toContain('Gratis parkeren')
    })
})
