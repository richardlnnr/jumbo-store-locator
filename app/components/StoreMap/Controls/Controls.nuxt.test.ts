import { beforeEach, describe, expect, it } from 'vitest'

import { useUserLocationStore } from '~~/app/stores/useUserLocationStore'
import { createFakeMap } from '~~/test-utils/createFakeMap'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'

import Controls from './Controls.vue'

describe('StoreMapControls', () => {
    beforeEach(async () => {
        useUserLocationStore().$resetForTests()
        await setI18nLocale('en')
    })

    it('Should mount the locator and the zoom stack', async () => {
        const wrapper = await mountWithUApp(Controls, { map: createFakeMap().fakeMap })

        expect(wrapper.find('[data-slot="store-map-controls"]').exists()).toBe(true)
        expect(wrapper.find('[data-slot="locator-button"]').exists()).toBe(true)
        expect(wrapper.find('[data-slot="zoom-controls"]').exists()).toBe(true)
    })

    it('Should anchor the stack to the bottom-right of its container', async () => {
        const wrapper = await mountWithUApp(Controls, { map: createFakeMap().fakeMap })

        const stack = wrapper.find('[data-slot="store-map-controls"]')
        const className = stack.attributes('class') ?? ''
        expect(className).toContain('absolute')
        expect(className).toContain('right-4')
        expect(className).toContain('bottom-4')
    })
})
