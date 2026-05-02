import { describe, expect, it } from 'vitest'

import { supermarketFixture } from '~~/shared/types/store.mock'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'

import Address from './Address.vue'

describe('StorePopupAddress', () => {
    it('Should render the address split across two lines with the house number on the first line', async () => {
        const wrapper = await mountWithUApp(Address, {
            address: supermarketFixture.location.address,
        })

        expect(wrapper.text()).toContain('Nederlandplein 103')
        expect(wrapper.text()).toContain('5628AJ Eindhoven')
    })

    it('Should omit the house number from the address line when none is provided', async () => {
        const wrapper = await mountWithUApp(Address, {
            address: {
                ...supermarketFixture.location.address,
                street: 'Hortensialaan 2',
                houseNumber: undefined,
            },
        })

        expect(wrapper.text()).toContain('Hortensialaan 2')
        expect(wrapper.text()).not.toContain('undefined')
    })
})
