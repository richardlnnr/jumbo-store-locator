const sharedDatetimeFormats = {
    time: { hour: '2-digit', minute: '2-digit', hour12: false },
    weekday: { weekday: 'long' },
} as const

export default defineI18nConfig(() => ({
    legacy: false,
    datetimeFormats: {
        en: sharedDatetimeFormats,
        nl: sharedDatetimeFormats,
    },
}))
