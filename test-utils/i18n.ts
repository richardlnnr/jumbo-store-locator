import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

type SupportedLocale = 'en' | 'nl'

const localeSetter = (code: SupportedLocale) => defineComponent({
    async setup() {
        const { setLocale } = useI18n()
        await setLocale(code)
        return () => null
    },
})

export async function setI18nLocale(code: SupportedLocale): Promise<void> {
    await mountSuspended(localeSetter(code))
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 50))
    await flushPromises()
}
