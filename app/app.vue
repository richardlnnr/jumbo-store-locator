<script setup lang="ts">
const { t } = useI18n()

useHead({
    title: () => t('app.title'),
})
</script>

<template>
    <UApp>
        <NuxtRouteAnnouncer />
        <section class="flex flex-col items-center pb-12 px-4">
            <MapBox class="max-w-[980px] w-full" />
        </section>
    </UApp>
</template>
