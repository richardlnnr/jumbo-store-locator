<script setup lang="ts">
const { locale, locales, setLocale, t } = useI18n()

const items = computed(() =>
    locales.value.map(l => ({
        code: l.code,
        label: l.code.toUpperCase(),
    })),
)

async function select(code: string) {
    if (locale.value === code) return
    await setLocale(code as typeof locale.value)
}
</script>

<template>
    <div
        role="group"
        :aria-label="t('app-header.language-toggle.label')"
        class="flex items-center gap-2 rounded-full bg-neutral-100 p-2"
    >
        <UIcon
            name="i-lucide-globe"
            aria-hidden="true"
            class="ml-2 hidden size-4 text-neutral-900 md:block"
        />
        <UButton
            v-for="item in items"
            :key="item.code"
            color="neutral"
            :variant="locale === item.code ? 'solid' : 'ghost'"
            size="sm"
            :aria-pressed="locale === item.code"
            :ui="{
                base: [
                    'rounded-full text-xs font-bold tracking-wider transition-colors',
                    locale === item.code
                        ? 'bg-yellow-200 px-4 py-2 text-neutral-900 hover:bg-yellow-200'
                        : 'bg-transparent px-3 py-2 text-neutral-900 hover:bg-neutral-200',
                ],
            }"
            @click="select(item.code)"
        >
            {{ item.label }}
        </UButton>
    </div>
</template>
