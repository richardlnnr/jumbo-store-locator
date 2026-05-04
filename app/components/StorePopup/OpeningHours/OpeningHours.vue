<script setup lang="ts">
import { addDays, format, isSameDay, parse, startOfWeek } from 'date-fns'
import { computed } from 'vue'

import type {
    StoreOpeningDay,
    StoreOpeningHours,
    StoreOpeningWindow,
} from '~~/shared/types/store'

const props = defineProps<{
    openingHours: StoreOpeningHours
}>()

const { t, d } = useI18n()

const formatTimeRange = (window: StoreOpeningWindow | undefined): string | null => {
    if (!window?.opensAt || !window?.closesAt) return null
    const refDate = new Date(0)
    const opens = d(parse(window.opensAt.slice(0, 5), 'HH:mm', refDate), 'time')
    const closes = d(parse(window.closesAt.slice(0, 5), 'HH:mm', refDate), 'time')
    return `${opens} – ${closes}`
}

const dayRows = computed(() => {
    const today = new Date()
    const weekStart = startOfWeek(today, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i)
        const day = format(date, 'EEEE').toLowerCase() as StoreOpeningDay
        return {
            day,
            weekday: d(date, 'weekday'),
            timeRange: formatTimeRange(props.openingHours[day]),
            isToday: isSameDay(date, today),
        }
    })
})
</script>

<template>
    <section class="flex flex-col gap-2 border-t border-neutral-100 px-5 py-4">
        <div class="flex items-center gap-2">
            <UIcon
                name="i-lucide-clock"
                class="size-4 shrink-0 text-neutral-600"
            />
            <h3 class="text-sm font-bold tracking-wider text-neutral-950 uppercase">
                {{ t('store-popup.opening-hours') }}
            </h3>
        </div>
        <ul class="flex flex-col gap-1 pt-1">
            <li
                v-for="row in dayRows"
                :key="row.day"
                :data-today="row.isToday ? 'true' : undefined"
                :class="[
                    'flex items-center justify-between rounded-lg px-3 py-2',
                    row.isToday
                        ? 'bg-yellow-50 font-bold text-neutral-950'
                        : 'text-neutral-600',
                ]"
            >
                <span class="text-xs">
                    {{ row.isToday ? t('store-popup.today', { weekday: row.weekday }) : row.weekday }}
                </span>
                <span class="text-xs">
                    {{ row.timeRange ?? t('store-popup.closed-day') }}
                </span>
            </li>
        </ul>
    </section>
</template>
