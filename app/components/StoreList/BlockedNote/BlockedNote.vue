<script setup lang="ts">
const { t } = useI18n()
const userLocation = useUserLocationStore()

const visible = computed(() => userLocation.permissionState === 'denied')
</script>

<template>
    <p
        v-if="visible"
        data-slot="blocked-note"
        class="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2 text-xs leading-5 text-neutral-600"
    >
        <UIcon
            name="i-lucide-locate-off"
            aria-hidden="true"
            class="size-4 shrink-0 text-neutral-500"
        />
        {{ t('geolocation.blocked-note') }}
    </p>
</template>
