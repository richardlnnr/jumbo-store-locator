import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { setI18nLocale } from '~~/test-utils/i18n'
import StatusPill from './StatusPill.vue'

describe('StatusPill', () => {
    beforeEach(async () => {
        await setI18nLocale('en')
    })

    it('Should render the localized "Open" label when isOpen is true in English', async () => {
        const wrapper = await mountSuspended(StatusPill, { props: { isOpen: true } })

        expect(wrapper.text()).toContain('Open')
        expect(wrapper.text()).not.toContain('Closed')
    })

    it('Should render the localized "Closed" label when isOpen is false in English', async () => {
        const wrapper = await mountSuspended(StatusPill, { props: { isOpen: false } })

        expect(wrapper.text()).toContain('Closed')
    })

    it('Should render the Dutch open label when locale is nl', async () => {
        await setI18nLocale('nl')

        const wrapper = await mountSuspended(StatusPill, { props: { isOpen: true } })

        expect(wrapper.text()).toContain('Open')
    })

    it('Should render the Dutch closed label when locale is nl', async () => {
        await setI18nLocale('nl')

        const wrapper = await mountSuspended(StatusPill, { props: { isOpen: false } })

        expect(wrapper.text()).toContain('Gesloten')
    })

    it('Should render a leading status dot alongside the label', async () => {
        const wrapper = await mountSuspended(StatusPill, { props: { isOpen: true } })

        const dot = wrapper.find('[data-slot="dot"]')
        expect(dot.exists()).toBe(true)
    })
})
