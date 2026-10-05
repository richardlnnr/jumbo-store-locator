<script setup lang="ts">
const { t } = useI18n()
const userLocation = useUserLocationStore()

const visible = computed(() =>
    !userLocation.bannerDismissed
    && userLocation.state !== 'loading'
    && userLocation.permissionState === 'prompt',
)
</script>

<template>
    <div
        v-if="visible"
        data-slot="consent-banner"
        class="flex flex-col gap-3 rounded-2xl border border-yellow-200 bg-yellow-100 p-4"
    >
        <div class="flex items-start gap-3">
            <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-yellow-500">
                <UIcon
                    name="i-lucide-locate-fixed"
                    aria-hidden="true"
                    class="size-4 text-neutral-900"
                />
            </span>
            <div class="flex flex-1 flex-col gap-1">
                <h2 class="text-base leading-5 font-bold text-neutral-900">
                    {{ t('geolocation.banner-message') }}
                </h2>
                <p class="text-xs leading-5 text-neutral-600">
                    {{ t('geolocation.banner-submessage') }}
                </p>
            </div>
        </div>
        <div class="flex items-center justify-between gap-3 pt-1">
            <div class="flex gap-2">
                <UButton
                    color="neutral"
                    variant="solid"
                    size="sm"
                    :ui="{ base: 'rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800' }"
                    @click="userLocation.requestPrecise"
                >
                    {{ t('geolocation.banner-allow') }}
                </UButton>
                <UButton
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    :ui="{ base: 'rounded-full px-3.5 py-2 text-xs font-semibold text-neutral-900 hover:bg-yellow-200' }"
                    @click="userLocation.dismissBanner"
                >
                    {{ t('geolocation.banner-dismiss') }}
                </UButton>
            </div>
            <NuxtLink
                to="/privacy"
                class="text-xs font-medium text-neutral-600 underline decoration-neutral-400 hover:text-neutral-900"
            >
                {{ t('geolocation.banner-learn-more') }}
            </NuxtLink>
        </div>
    </div>
</template>
