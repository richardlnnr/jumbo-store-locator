import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MapLoadingOverlay from './MapLoadingOverlay.vue'

describe('MapLoadingOverlay', () => {
    it('Should render the headline and caption from i18n', async () => {
        const wrapper = await mountSuspended(MapLoadingOverlay)

        expect(wrapper.text()).toContain('Loading map')
        expect(wrapper.text()).toContain('Finding stores near you')
    })

    it('Should expose the loading state through a native output element', async () => {
        const wrapper = await mountSuspended(MapLoadingOverlay)

        const root = wrapper.find('output')
        expect(root.exists()).toBe(true)
        expect(root.attributes('aria-busy')).toBe('true')
    })

    it('Should gate the spinner behind motion-safe', async () => {
        const wrapper = await mountSuspended(MapLoadingOverlay)

        const spinner = wrapper.find('.motion-safe\\:animate-spin')
        expect(spinner.exists()).toBe(true)
    })

    it('Should gate ghost-pin pulses behind motion-safe', async () => {
        const wrapper = await mountSuspended(MapLoadingOverlay)

        const pulses = wrapper.findAll('.motion-safe\\:animate-pulse')
        expect(pulses).toHaveLength(3)
    })

    it('Should hide the desktop map controls below md', async () => {
        const wrapper = await mountSuspended(MapLoadingOverlay)

        const controls = wrapper.find('.hidden.md\\:flex')
        expect(controls.exists()).toBe(true)
    })

    it('Should scale the headline up at md and the caption to text-sm', async () => {
        const wrapper = await mountSuspended(MapLoadingOverlay)

        const headline = wrapper.find('p.text-base.md\\:text-lg')
        const caption = wrapper.find('p.text-\\[13px\\].md\\:text-sm')
        expect(headline.exists()).toBe(true)
        expect(caption.exists()).toBe(true)
    })
})
