import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useUserLocationStore } from '~~/app/stores/useUserLocationStore'
import type { PermissionState } from '~~/shared/types/userGeolocation'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'

import BlockedNote from './BlockedNote.vue'

const NON_DENIED_STATES: PermissionState[] = ['unknown', 'granted', 'prompt', 'unsupported']

describe('StoreListBlockedNote', () => {
    beforeEach(async () => {
        useUserLocationStore().$resetForTests()
        await setI18nLocale('en')
    })

    afterEach(() => {
        useUserLocationStore().$resetForTests()
    })

    it('Should render the note when permission state is denied', async () => {
        useUserLocationStore().permissionState = 'denied'

        const wrapper = await mountWithUApp(BlockedNote)

        const note = wrapper.find('[data-slot="blocked-note"]')
        expect(note.exists()).toBe(true)
        expect(note.text()).toContain('Location blocked in your browser')
    })

    it.each(NON_DENIED_STATES)('Should hide the note when permission state is %s', async (state) => {
        useUserLocationStore().permissionState = state

        const wrapper = await mountWithUApp(BlockedNote)

        expect(wrapper.find('[data-slot="blocked-note"]').exists()).toBe(false)
    })
})
