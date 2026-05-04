import { describe, expect, it } from 'vitest'

import { highlightMatch } from './highlightMatch'

describe('highlightMatch', () => {
    it('Should return a single non-bold segment when the query is empty', () => {
        const segments = highlightMatch('Jumbo Amsterdam', '')

        expect(segments).toEqual([{ text: 'Jumbo Amsterdam', bold: false }])
    })

    it('Should return a single non-bold segment when the query is whitespace only', () => {
        const segments = highlightMatch('Jumbo Amsterdam', '   ')

        expect(segments).toEqual([{ text: 'Jumbo Amsterdam', bold: false }])
    })

    it('Should return a single non-bold segment when the text is empty', () => {
        const segments = highlightMatch('', 'amsterdam')

        expect(segments).toEqual([{ text: '', bold: false }])
    })

    it('Should split around a single case-insensitive match in the middle', () => {
        const segments = highlightMatch('Jumbo Amsterdam Baarsjesweg', 'amsterdam')

        expect(segments).toEqual([
            { text: 'Jumbo ', bold: false },
            { text: 'Amsterdam', bold: true },
            { text: ' Baarsjesweg', bold: false },
        ])
    })

    it('Should highlight multiple non-overlapping occurrences of the query', () => {
        const segments = highlightMatch('Banana', 'a')

        expect(segments).toEqual([
            { text: 'B', bold: false },
            { text: 'a', bold: true },
            { text: 'n', bold: false },
            { text: 'a', bold: true },
            { text: 'n', bold: false },
            { text: 'a', bold: true },
        ])
    })

    it('Should preserve the original casing of the matched substring', () => {
        const segments = highlightMatch('AMSTERDAM', 'amst')

        expect(segments).toEqual([
            { text: 'AMST', bold: true },
            { text: 'ERDAM', bold: false },
        ])
    })

    it('Should treat the entire text as a single bold segment when the query equals the text', () => {
        const segments = highlightMatch('Amsterdam', 'amsterdam')

        expect(segments).toEqual([{ text: 'Amsterdam', bold: true }])
    })

    it('Should return a single non-bold segment when the query is longer than the text', () => {
        const segments = highlightMatch('Aalst', 'amsterdam')

        expect(segments).toEqual([{ text: 'Aalst', bold: false }])
    })

    it('Should treat regex special characters as literal substrings', () => {
        const segments = highlightMatch('a.b+c?d', '.+')

        expect(segments).toEqual([{ text: 'a.b+c?d', bold: false }])
    })

    it('Should highlight a literal substring that contains regex special characters', () => {
        const segments = highlightMatch('Plein 40-45 store', '40-45')

        expect(segments).toEqual([
            { text: 'Plein ', bold: false },
            { text: '40-45', bold: true },
            { text: ' store', bold: false },
        ])
    })

    it('Should trim whitespace around the query before matching', () => {
        const segments = highlightMatch('Jumbo Amsterdam', '   amsterdam   ')

        expect(segments).toEqual([
            { text: 'Jumbo ', bold: false },
            { text: 'Amsterdam', bold: true },
        ])
    })
})
