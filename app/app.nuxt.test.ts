import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import App from './app.vue'

describe('app.vue', () => {
    it('Should mount inside the Nuxt runtime', async () => {
        const component = await mountSuspended(App)

        expect(component.html()).toBeTruthy()
    })

    it('Should set the document title from the default English locale', async () => {
        await mountSuspended(App)
        await nextTick()

        expect(document.title).toBe('Jumbo store locator')
    })
})
