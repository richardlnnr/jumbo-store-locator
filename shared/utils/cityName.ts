/**
 * Convert a raw city string from the upstream feed (often ALL CAPS) into a
 * display-friendly title-case form, while preserving short uppercase tokens
 * that look like country/region codes (e.g. "AALST (NL)" → "Aalst (NL)").
 */
export function formatCityName(city: string): string {
    return city.replace(/\b([\p{L}']+)\b/gu, (word) => {
        if (word.length <= 2 && word === word.toUpperCase()) return word
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
}
