import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setI18nLocale } from '~~/test-utils/i18n'
import StoreStatusText from './StoreStatusText.vue'

const tuesday = (hour: number, minute = 0) => new Date(2025, 0, 7, hour, minute)
const wednesday = (hour: number, minute = 0) => new Date(2025, 0, 8, hour, minute)
const monday = (hour: number, minute = 0) => new Date(2025, 0, 13, hour, minute)

describe('StoreStatusText', () => {
    beforeEach(async () => {
        await setI18nLocale('en')
    })

    it('Should render nothing when next is null', async () => {
        const wrapper = await mountSuspended(StoreStatusText, { props: { next: null } })

        expect(wrapper.text()).toBe('')
        expect(wrapper.find('span').exists()).toBe(false)
    })

    it('Should render "Closes at HH:mm" with the closing time when next is closes-at', async () => {
        const wrapper = await mountSuspended(StoreStatusText, {
            props: { next: { key: 'status.closes-at', at: tuesday(22) } },
        })

        expect(wrapper.text()).toContain('Closes at 22:00')
    })

    it('Should render "Opens today at HH:mm" when next is opens-today-at', async () => {
        const wrapper = await mountSuspended(StoreStatusText, {
            props: { next: { key: 'status.opens-today-at', at: tuesday(8) } },
        })

        expect(wrapper.text()).toContain('Opens today at 08:00')
    })

    it('Should render "Opens tomorrow at HH:mm" when next is opens-tomorrow-at', async () => {
        const wrapper = await mountSuspended(StoreStatusText, {
            props: { next: { key: 'status.opens-tomorrow-at', at: wednesday(8) } },
        })

        expect(wrapper.text()).toContain('Opens tomorrow at 08:00')
    })

    it('Should render "Opens {weekday} at HH:mm" when next is opens-on', async () => {
        const wrapper = await mountSuspended(StoreStatusText, {
            props: { next: { key: 'status.opens-on', at: monday(8) } },
        })

        expect(wrapper.text()).toContain('Opens Monday at 08:00')
    })

    it('Should render the Dutch translation with localized weekday when locale is nl', async () => {
        await setI18nLocale('nl')

        const wrapper = await mountSuspended(StoreStatusText, {
            props: { next: { key: 'status.opens-on', at: monday(8) } },
        })

        expect(wrapper.text()).toContain('Open op maandag om 08:00')
    })
})
