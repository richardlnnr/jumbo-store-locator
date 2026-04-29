import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setI18nLocale } from '~~/test-utils/i18n'
import DistanceText from './DistanceText.vue'

describe('DistanceText', () => {
    beforeEach(async () => {
        await setI18nLocale('en')
    })

    it('Should render nothing when label is null', async () => {
        const wrapper = await mountSuspended(DistanceText, { props: { label: null } })

        expect(wrapper.text()).toBe('')
        expect(wrapper.find('span').exists()).toBe(false)
    })

    it('Should render "{distance} km" when label key is distance.km', async () => {
        const wrapper = await mountSuspended(DistanceText, {
            props: { label: { key: 'distance.km', distance: 5.7 } },
        })

        expect(wrapper.text()).toContain('5.7 km')
    })

    it('Should render "{distance} m" when label key is distance.m', async () => {
        const wrapper = await mountSuspended(DistanceText, {
            props: { label: { key: 'distance.m', distance: 500 } },
        })

        expect(wrapper.text()).toContain('500 m')
    })

    it('Should keep rendering the labelled distance after switching to nl', async () => {
        await setI18nLocale('nl')

        const wrapper = await mountSuspended(DistanceText, {
            props: { label: { key: 'distance.km', distance: 5.7 } },
        })

        expect(wrapper.text()).toContain('5.7 km')
    })
})
