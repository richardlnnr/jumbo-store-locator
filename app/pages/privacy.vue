<script setup lang="ts">
definePageMeta({ colorMode: 'light' })

const { t } = useI18n()

useHead({
    title: () => `${t('privacy.title')} · ${t('app.title')}`,
})

const neverBullets = computed(() => [
    t('privacy.never-servers'),
    t('privacy.never-ip'),
    t('privacy.never-persist'),
    t('privacy.never-ads'),
])
</script>

<template>
    <main class="flex min-h-0 flex-1 justify-center overflow-y-auto bg-white px-6 py-16 md:px-12 md:py-20">
        <article class="flex w-full max-w-180 flex-col gap-12">
            <header class="flex flex-col gap-4">
                <NuxtLink
                    to="/stores"
                    class="flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-neutral-900"
                >
                    <UIcon
                        name="i-lucide-chevron-left"
                        aria-hidden="true"
                        class="size-3.5"
                    />
                    {{ t('privacy.back-link') }}
                </NuxtLink>
                <h1 class="text-3xl font-black leading-tight tracking-tight text-neutral-900 md:text-5xl">
                    {{ t('privacy.title') }}
                </h1>
                <p class="max-w-150 text-base leading-7 text-neutral-600">
                    {{ t('privacy.intro') }}
                </p>
            </header>

            <section class="flex gap-6 border-t border-neutral-100 pt-7">
                <div class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-yellow-200 bg-yellow-100">
                    <UIcon
                        name="i-lucide-map-pin"
                        aria-hidden="true"
                        class="size-5 text-neutral-900"
                    />
                </div>
                <div class="flex flex-1 flex-col gap-2">
                    <h2 class="text-3xl leading-7 font-bold text-neutral-900">
                        {{ t('privacy.precise-title') }}
                    </h2>
                    <p class="text-base leading-6 text-neutral-600">
                        {{ t('privacy.precise-body') }}
                    </p>
                </div>
            </section>

            <section class="flex gap-6 border-t border-neutral-100 pt-7">
                <div class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-yellow-200 bg-yellow-100">
                    <UIcon
                        name="i-lucide-globe"
                        aria-hidden="true"
                        class="size-5 text-neutral-900"
                    />
                </div>
                <div class="flex flex-1 flex-col gap-2">
                    <h2 class="text-3xl leading-7 font-bold text-neutral-900">
                        {{ t('privacy.coarse-title') }}
                    </h2>
                    <p class="text-base leading-6 text-neutral-600">
                        {{ t('privacy.coarse-body') }}
                    </p>
                </div>
            </section>

            <section class="flex gap-6 border-t border-neutral-100 pt-7">
                <div class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white">
                    <UIcon
                        name="i-lucide-ban"
                        aria-hidden="true"
                        class="size-5 text-neutral-900"
                    />
                </div>
                <div class="flex flex-1 flex-col gap-3">
                    <h2 class="text-3xl leading-7 font-bold text-neutral-900">
                        {{ t('privacy.never-title') }}
                    </h2>
                    <ul class="flex flex-col gap-2.5">
                        <li
                            v-for="bullet in neverBullets"
                            :key="bullet"
                            class="flex items-start gap-2.5 text-base leading-6 text-neutral-600"
                        >
                            <span class="mt-2.5 block size-1.5 shrink-0 rounded-full bg-neutral-900" />
                            <span>{{ bullet }}</span>
                        </li>
                    </ul>
                </div>
            </section>

            <section class="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 px-6 py-7">
                <span class="text-sm font-bold uppercase tracking-wider text-neutral-500">
                    {{ t('privacy.control-title') }}
                </span>
                <p class="text-sm leading-6 text-neutral-600">
                    {{ t('privacy.control-body') }}
                </p>
            </section>
        </article>
    </main>
</template>
