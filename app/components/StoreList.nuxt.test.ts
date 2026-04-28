import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import StoreList from './StoreList.vue'

describe('StoreList', () => {
    it('Should expose a region landmark with the provided aria-label', async () => {
        const wrapper = await mountSuspended(StoreList, {
            attrs: { 'aria-label': 'Store list' },
        })

        const aside = wrapper.find('aside')
        expect(aside.exists()).toBe(true)
        expect(aside.attributes('role')).toBe('region')
        expect(aside.attributes('aria-label')).toBe('Store list')
    })

    it('Should render the i18n placeholder copy', async () => {
        const wrapper = await mountSuspended(StoreList)

        expect(wrapper.text()).toContain('Store list coming soon')
    })
})
