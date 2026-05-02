<template>
    <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        class="absolute inset-0 overflow-hidden bg-yellow-50"
    >
        <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 opacity-85"
        >
            <div class="absolute top-[12%] left-[-5%] h-3 w-[120%] origin-top-left rotate-[-3deg] rounded-full bg-neutral-100" />
            <div class="absolute top-[32%] left-[-5%] h-3.5 w-[125%] origin-top-left rotate-[2deg] rounded-full bg-neutral-100" />
            <div class="absolute top-[58%] left-[-5%] h-3 w-[125%] origin-top-left rotate-[-1.5deg] rounded-full bg-neutral-100" />
            <div class="absolute top-[82%] left-[-5%] h-3.5 w-[125%] origin-top-left rotate-[1deg] rounded-full bg-neutral-100" />
            <div class="absolute top-[-5%] left-[22%] h-[120%] w-3 origin-top-left rotate-[4deg] rounded-full bg-neutral-100" />
            <div class="absolute top-[-5%] left-[50%] h-[120%] w-3 origin-top-left rotate-[-2deg] rounded-full bg-neutral-100" />
            <div class="absolute top-[-5%] left-[78%] h-[120%] w-3.5 origin-top-left rotate-[3deg] rounded-full bg-neutral-100" />
        </div>

        <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-0"
        >
            <div
                class="absolute top-[22%] left-[24%] motion-safe:animate-pulse"
                style="animation-delay: 0s"
            >
                <div class="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-200 opacity-35" />
                <div class="relative size-11 rounded-full border-2 border-neutral-100 bg-yellow-50" />
            </div>
            <div
                class="absolute top-[50%] left-[58%] motion-safe:animate-pulse"
                style="animation-delay: -0.6s"
            >
                <div class="absolute top-1/2 left-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-200 opacity-40" />
                <div class="relative size-12 rounded-full border-2 border-neutral-100 bg-yellow-50" />
            </div>
            <div
                class="absolute top-[72%] left-[80%] motion-safe:animate-pulse"
                style="animation-delay: -1.2s"
            >
                <div class="absolute top-1/2 left-1/2 size-15 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-200 opacity-30" />
                <div class="relative size-11 rounded-full border-2 border-neutral-100 bg-yellow-50" />
            </div>
        </div>

        <div
            aria-hidden="true"
            class="pointer-events-none absolute top-6 right-6 hidden flex-col gap-2 opacity-55 md:flex"
        >
            <div class="flex size-9 items-center justify-center rounded-lg border border-neutral-100 bg-white shadow-sm">
                <UIcon
                    name="i-lucide-plus"
                    class="size-4 text-neutral-400"
                />
            </div>
            <div class="flex size-9 items-center justify-center rounded-lg border border-neutral-100 bg-white shadow-sm">
                <UIcon
                    name="i-lucide-minus"
                    class="size-4 text-neutral-400"
                />
            </div>
            <div class="mt-1 flex size-9 items-center justify-center rounded-lg border border-neutral-100 bg-white shadow-sm">
                <UIcon
                    name="i-lucide-locate-fixed"
                    class="size-4 text-neutral-400"
                />
            </div>
        </div>

        <div class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3.5 rounded-full border border-neutral-100 bg-white py-4 pr-5.5 pl-4.5 shadow-lg md:gap-4 md:py-5 md:pr-7 md:pl-6">
            <UIcon
                name="i-lucide-loader-circle"
                class="size-8 shrink-0 text-yellow-500 motion-safe:animate-spin md:size-9"
                aria-hidden="true"
            />
            <div class="flex flex-col gap-0.5">
                <p class="text-base font-semibold tracking-[-0.01em] text-neutral-900 md:text-lg">
                    {{ $t('map-loading.headline') }}
                </p>
                <p class="text-[13px] text-neutral-600 md:text-sm">
                    {{ $t('map-loading.caption') }}
                </p>
            </div>
        </div>
    </div>
</template>
