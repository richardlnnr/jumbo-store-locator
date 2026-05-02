import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'
import { setI18nLocale } from '~~/test-utils/i18n'
import { supermarketFixture } from '~~/shared/types/store.mock'
import StoreListItem from './StoreListItem.vue'

describe('StoreListItem', () => {
    beforeEach(async () => {
        await setI18nLocale('en')
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(new Date('2026-04-29T10:00:00+02:00'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('Should render the store name and address', async () => {
        const wrapper = await mountWithUApp(StoreListItem, { store: supermarketFixture })

        expect(wrapper.text()).toContain(supermarketFixture.name)
        expect(wrapper.text()).toContain('Nederlandplein 103')
        expect(wrapper.text()).toContain('5628AJ Eindhoven')
    })

    it('Should omit the house number from the address line when the upstream feed does not provide one', async () => {
        const storeWithoutHouseNumber = {
            ...supermarketFixture,
            location: {
                ...supermarketFixture.location,
                address: {
                    ...supermarketFixture.location.address,
                    street: 'Hortensialaan 2',
                    houseNumber: undefined,
                },
            },
        }

        const wrapper = await mountWithUApp(StoreListItem, { store: storeWithoutHouseNumber })

        expect(wrapper.text()).toContain('Hortensialaan 2, 5628AJ Eindhoven')
        expect(wrapper.text()).not.toContain('undefined')
    })

    it('Should render the distance text when a distanceLabel is provided', async () => {
        const wrapper = await mountWithUApp(StoreListItem, {
            store: supermarketFixture,
            distanceLabel: { key: 'distance.km', distance: 1.2 },
        })

        expect(wrapper.text()).toContain('1.2 km')
    })

    it('Should not render distance text when no distanceLabel is provided', async () => {
        const wrapper = await mountWithUApp(StoreListItem, { store: supermarketFixture })

        expect(wrapper.text()).not.toContain('km')
        expect(wrapper.text()).not.toMatch(/\d+\s*m\b/)
    })

    it('Should not render distance text when distanceLabel is explicitly null', async () => {
        const wrapper = await mountWithUApp(StoreListItem, {
            store: supermarketFixture,
            distanceLabel: null,
        })

        expect(wrapper.text()).not.toContain('km')
    })

    it('Should reflect the selected variant via aria-pressed and the selected class', async () => {
        const wrapper = await mountWithUApp(StoreListItem, {
            store: supermarketFixture,
            selected: true,
        })

        const trigger = wrapper.find('button')
        expect(trigger.attributes('aria-pressed')).toBe('true')
        expect(trigger.classes().some((className: string) => className.includes('border-l-yellow-500'))).toBe(true)
    })

    it('Should not apply the selected variant when selected is false', async () => {
        const wrapper = await mountWithUApp(StoreListItem, {
            store: supermarketFixture,
            selected: false,
        })

        const trigger = wrapper.find('button')
        expect(trigger.attributes('aria-pressed')).toBe('false')
        expect(trigger.classes().some((className: string) => className.includes('border-l-yellow-500'))).toBe(false)
    })

    it('Should emit select when the row is clicked', async () => {
        const wrapper = await mountWithUApp(StoreListItem, { store: supermarketFixture })

        await wrapper.find('button').trigger('click')

        const inner = wrapper.findComponent(StoreListItem)
        expect(inner.emitted('select')).toHaveLength(1)
    })

    it('Should apply the truncate utility on the name node so long names ellipsize', async () => {
        const wrapper = await mountWithUApp(StoreListItem, {
            store: { ...supermarketFixture, name: 'A very very long store name that should not push the distance off the row' },
            distanceLabel: { key: 'distance.km', distance: 999 },
        })

        const nameNode = wrapper.get('[data-slot="name"]')
        expect(nameNode.classes()).toContain('truncate')
    })
})
