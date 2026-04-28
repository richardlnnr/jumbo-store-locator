import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { h } from 'vue'
import DefaultLayout from './default.vue'

describe('default layout', () => {
    it('Should render a sticky AppHeader and the page slot content', async () => {
        const wrapper = await mountSuspended(DefaultLayout, {
            slots: {
                default: () => h('main', { 'data-testid': 'page-body' }, 'page content'),
            },
        })

        const header = wrapper.find('header')
        expect(header.exists()).toBe(true)
        expect(header.classes()).toContain('sticky')

        const body = wrapper.find('[data-testid="page-body"]')
        expect(body.exists()).toBe(true)
        expect(body.text()).toBe('page content')
    })

    it('Should fill the dynamic viewport height', async () => {
        const wrapper = await mountSuspended(DefaultLayout)

        expect(wrapper.html()).toContain('h-dvh')
    })
})
