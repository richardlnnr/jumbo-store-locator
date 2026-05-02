<script setup lang="ts">
const props = defineProps<{ isOpen: boolean }>()

const { t } = useI18n()

const color = computed(() => (props.isOpen ? 'success' : 'error'))
const label = computed(() => (props.isOpen ? t('status.open') : t('status.closed')))
const dotClass = computed(() => (props.isOpen ? 'bg-success-500' : 'bg-error-500'))
</script>

<template>
    <UBadge
        :color="color"
        variant="soft"
        size="md"
        :ui="{ base: 'rounded-full font-bold gap-2 px-3 py-1' }"
    >
        <template #leading>
            <span
                data-slot="dot"
                class="size-2 shrink-0 rounded-full"
                :class="dotClass"
            />
        </template>
        {{ label }}
    </UBadge>
</template>
