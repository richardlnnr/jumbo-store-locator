<script setup lang="ts">
const { t } = useI18n()

useHead({
    title: () => t('app.title'),
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
