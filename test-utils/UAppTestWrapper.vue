<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
    component: Component
    componentProps?: Record<string, unknown>
}>()

defineOptions({ inheritAttrs: false })
</script>

<template>
    <UApp>
        <component
            :is="component"
            v-bind="componentProps"
        />
    </UApp>
</template>
