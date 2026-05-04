import { describe, expect, it } from 'vitest'

import { MATCH_SCORE, scoreText } from './scoreText'

describe('scoreText', () => {
    it('Should return EXACT when the query is empty', () => {
        expect(scoreText('Helmond', '')).toBe(MATCH_SCORE.EXACT)
    })

    it('Should return EXACT when the query is whitespace only', () => {
        expect(scoreText('Helmond', '   ')).toBe(MATCH_SCORE.EXACT)
    })

    it('Should return EXACT when text equals the query case-insensitively', () => {
        expect(scoreText('Helmond', 'helmond')).toBe(MATCH_SCORE.EXACT)
        expect(scoreText('HELMOND', 'helmond')).toBe(MATCH_SCORE.EXACT)
    })

    it('Should return PREFIX when the text starts with the query', () => {
        expect(scoreText('Helmond', 'Helm')).toBe(MATCH_SCORE.PREFIX)
    })

    it('Should be case-insensitive for the starts-with check', () => {
        expect(scoreText('helmond', 'HELM')).toBe(MATCH_SCORE.PREFIX)
    })

    it('Should return CONTAINS when the query is contained but not at the start', () => {
        expect(scoreText('Jumbo Helmond Centrum', 'Helm')).toBe(MATCH_SCORE.CONTAINS)
    })

    it('Should return NO_MATCH when the query is not present in the text', () => {
        expect(scoreText('Amsterdam', 'Helm')).toBe(MATCH_SCORE.NO_MATCH)
    })

    it('Should ignore leading and trailing whitespace in the query', () => {
        expect(scoreText('Helmond', '  Helm  ')).toBe(MATCH_SCORE.PREFIX)
    })

    it('Should treat regex special characters as literal substrings', () => {
        expect(scoreText('Plein 40-45 store', '40-45')).toBe(MATCH_SCORE.CONTAINS)
    })
})
