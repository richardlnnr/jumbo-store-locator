import { beforeEach, describe, expect, it } from 'vitest'
import type { DOMWrapper } from '@vue/test-utils'

import { supermarketFixture } from '~~/shared/types/store.mock'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'

import Footer from './Footer.vue'

describe('StorePopupFooter', () => {
    beforeEach(async () => {
        await setI18nLocale('en')
    })

    it('Should render the Open in Google Maps anchor with the encoded store name as the query and open in a new tab', async () => {
        const wrapper = await mountWithUApp(Footer, { storeName: supermarketFixture.name })

        const link = wrapper.findAll('a').find((anchor: DOMWrapper<Element>) =>
            anchor.attributes('href')?.includes('google.com/maps'),
        )
        expect(link).toBeDefined()
        const href = link!.attributes('href')!
        expect(href).toBe(
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supermarketFixture.name)}`,
        )
        expect(link!.attributes('target')).toBe('_blank')
        expect(link!.attributes('rel')).toContain('noopener')
        expect(link!.text()).toContain('Open in Google Maps')
    })
})
