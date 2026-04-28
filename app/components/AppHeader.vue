<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
    <header class="flex h-[55px] items-center justify-between border-b border-neutral-100 bg-white px-4 md:h-[72px] md:px-8">
        <div class="flex items-center gap-3">
            <span class="text-base font-black text-yellow-500 md:text-lg">{{ t('app-header.brand-name') }}</span>
            <span
                aria-hidden="true"
                class="h-6 w-px bg-neutral-200"
            />
            <span class="text-sm text-neutral-900 md:text-base">{{ t('app-header.tagline') }}</span>
        </div>
    </header>
</template>
