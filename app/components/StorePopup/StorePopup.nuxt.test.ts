import { describe, expect, it } from 'vitest'

import { supermarketFixture } from '~~/shared/types/store.mock'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'

import StorePopup from './StorePopup.vue'
import Address from './Address/Address.vue'
import FacilitiesList from './FacilitiesList/FacilitiesList.vue'
import Footer from './Footer/Footer.vue'
import Header from './Header/Header.vue'
import OpeningHours from './OpeningHours/OpeningHours.vue'

describe('StorePopup', () => {
    it('Should compose the header, address, opening hours, facilities, and footer children', async () => {
        const wrapper = await mountWithUApp(StorePopup, { store: supermarketFixture })

        expect(wrapper.findComponent(Header).exists()).toBe(true)
        expect(wrapper.findComponent(Address).exists()).toBe(true)
        expect(wrapper.findComponent(OpeningHours).exists()).toBe(true)
        expect(wrapper.findComponent(FacilitiesList).exists()).toBe(true)
        expect(wrapper.findComponent(Footer).exists()).toBe(true)
    })

    it('Should emit close when the Escape key is pressed', async () => {
        const wrapper = await mountWithUApp(StorePopup, { store: supermarketFixture })

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

        const inner = wrapper.findComponent(StorePopup)
        expect(inner.emitted('close')).toHaveLength(1)
    })

    it('Should keep the header and footer outside the scroll container while address, hours and facilities live inside it', async () => {
        const wrapper = await mountWithUApp(StorePopup, { store: supermarketFixture })

        const scroll = wrapper.find('[data-slot="scroll"]')
        expect(scroll.exists()).toBe(true)
        expect(scroll.classes()).toContain('overflow-y-auto')

        const card = wrapper.get('[data-component="store-popup"]')
        const headerEl = card.find('header').element
        const footerEl = card.find('footer').element
        expect(scroll.element.contains(headerEl)).toBe(false)
        expect(scroll.element.contains(footerEl)).toBe(false)

        const todayRow = wrapper.get('[data-today="true"]')
        expect(scroll.element.contains(todayRow.element)).toBe(true)
    })
})
