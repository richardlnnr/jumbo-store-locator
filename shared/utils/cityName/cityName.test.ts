import { describe, expect, it } from 'vitest'
import { formatCityName } from './cityName'

describe('formatCityName', () => {
    it('Should title-case a single ALL-CAPS city name', () => {
        expect(formatCityName('AMSTERDAM')).toBe('Amsterdam')
    })

    it('Should title-case each whitespace-separated word', () => {
        expect(formatCityName('DEN HAAG')).toBe('Den Haag')
    })

    it('Should preserve a parenthesised two-letter country code', () => {
        expect(formatCityName('AALST (NL)')).toBe('Aalst (NL)')
    })

    it('Should normalize already mixed-case input', () => {
        expect(formatCityName('aalsmeer')).toBe('Aalsmeer')
    })

    it('Should keep an already title-cased value unchanged', () => {
        expect(formatCityName('Rotterdam')).toBe('Rotterdam')
    })

    it('Should handle hyphenated names', () => {
        expect(formatCityName('S-HERTOGENBOSCH')).toBe('S-Hertogenbosch')
    })
})
