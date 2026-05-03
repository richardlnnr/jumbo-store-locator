<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { FocusScope } from 'reka-ui'

import type { Coordinate, JumboStore } from '~~/shared/types/store'

const props = defineProps<{
    store: JumboStore
    userLocation?: Coordinate | null
}>()

const emit = defineEmits<{ close: [] }>()

onKeyStroke('Escape', () => emit('close'))
</script>

<template>
    <FocusScope
        as-child
        trapped
        loop
    >
        <dialog
            open
            data-component="store-popup"
            aria-modal="true"
            :aria-label="props.store.name"
            class="static flex w-[min(380px,calc(100vw-32px))] max-h-(--store-popup-max-h,calc(100dvh-120px)) flex-col overflow-clip rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
        >
            <StorePopupHeader
                :store="store"
                :user-location="userLocation"
                @close="emit('close')"
            />
            <div
                data-slot="scroll"
                class="scrollbar-thin-neutral flex min-h-0 flex-1 flex-col overflow-y-auto"
            >
                <StorePopupAddress :address="store.location.address" />
                <StorePopupOpeningHours :opening-hours="store.openingHours" />
                <StorePopupFacilitiesList :facilities="store.facilities" />
            </div>
            <StorePopupFooter :store-name="store.name" />
        </dialog>
    </FocusScope>
</template>
