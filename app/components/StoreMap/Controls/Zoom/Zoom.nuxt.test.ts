import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createFakeMap } from '~~/test-utils/createFakeMap'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'

import Zoom from './Zoom.vue'

describe('StoreMapControlsZoom', () => {
    beforeEach(async () => {
        await setI18nLocale('en')
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('Should render zoom-in and zoom-out buttons with localized aria labels', async () => {
        const wrapper = await mountWithUApp(Zoom, { map: createFakeMap().fakeMap })

        expect(wrapper.find('button[aria-label="Zoom in"]').exists()).toBe(true)
        expect(wrapper.find('button[aria-label="Zoom out"]').exists()).toBe(true)
    })

    it('Should horizontally center the icon inside each 40x40 zoom button', async () => {
        const wrapper = await mountWithUApp(Zoom, { map: createFakeMap().fakeMap })

        expect(wrapper.find('button[aria-label="Zoom in"]').classes()).toContain('justify-center')
        expect(wrapper.find('button[aria-label="Zoom out"]').classes()).toContain('justify-center')
    })

    it('Should call map.zoomIn when the plus button is clicked', async () => {
        const fake = createFakeMap()

        const wrapper = await mountWithUApp(Zoom, { map: fake.fakeMap })
        await wrapper.find('button[aria-label="Zoom in"]').trigger('click')

        expect(fake.spies.zoomIn).toHaveBeenCalledTimes(1)
    })

    it('Should call map.zoomOut when the minus button is clicked', async () => {
        const fake = createFakeMap()

        const wrapper = await mountWithUApp(Zoom, { map: fake.fakeMap })
        await wrapper.find('button[aria-label="Zoom out"]').trigger('click')

        expect(fake.spies.zoomOut).toHaveBeenCalledTimes(1)
    })

    it('Should disable the plus button when current zoom is at the max', async () => {
        const fake = createFakeMap()
        fake.spies.getZoom.mockReturnValue(22)
        fake.spies.getMaxZoom.mockReturnValue(22)

        const wrapper = await mountWithUApp(Zoom, { map: fake.fakeMap })

        const plus = wrapper.find('button[aria-label="Zoom in"]')
        expect((plus.element as HTMLButtonElement).disabled).toBe(true)
    })

    it('Should disable the minus button when current zoom is at the min', async () => {
        const fake = createFakeMap()
        fake.spies.getZoom.mockReturnValue(6)
        fake.spies.getMinZoom.mockReturnValue(6)

        const wrapper = await mountWithUApp(Zoom, { map: fake.fakeMap })

        const minus = wrapper.find('button[aria-label="Zoom out"]')
        expect((minus.element as HTMLButtonElement).disabled).toBe(true)
    })
})
