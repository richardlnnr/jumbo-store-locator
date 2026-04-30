import type { Component } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UAppTestWrapper from './UAppTestWrapper.vue'

/**
 * Mount a component inside `<UApp>` so primitives that need the @nuxt/ui app
 * provider (Tooltip, Toast, Overlay, Reka ConfigProvider) work in
 * nuxt-environment component tests.
 *
 * Pass the inner component's props via `componentProps`. Emits and DOM are
 * accessible via the returned wrapper as usual.
 */
export function mountWithUApp(
    component: Component,
    componentProps: Record<string, unknown> = {},
): ReturnType<typeof mountSuspended> {
    return mountSuspended(UAppTestWrapper, {
        props: { component, componentProps },
    })
}
