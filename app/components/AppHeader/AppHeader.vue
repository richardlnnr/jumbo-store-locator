<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
    <header class="flex h-13.75 items-center justify-between border-b border-neutral-100 bg-white px-4 md:h-18 md:px-8">
        <div class="flex items-center gap-3 md:gap-4">
            <NuxtImg
                src="/jumbo-logo.svg"
                alt="Jumbo"
                :width="150"
                :height="30"
                class="h-5 w-auto md:h-7"
            />
            <span
                aria-hidden="true"
                class="h-6 w-px bg-neutral-200 md:h-7"
            />
            <span class="text-sm font-bold text-neutral-900 md:text-base">{{ t('app-header.tagline') }}</span>
        </div>
        <LanguageToggle />
    </header>
</template>
