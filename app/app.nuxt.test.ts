import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import App from './app.vue'

describe('app.vue', () => {
  it('Should mount inside the Nuxt runtime', async () => {
    const component = await mountSuspended(App)

    expect(component.html()).toBeTruthy()
  })
})
