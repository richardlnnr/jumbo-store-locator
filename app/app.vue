<script setup lang="ts">
const { t } = useI18n()
const userLocation = useUserLocationStore()

useHead({
    title: () => t('app.title'),
})

onMounted(() => {
    userLocation.initialize()
})
</script>

<template>
    <UApp>
        <NuxtRouteAnnouncer />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>
