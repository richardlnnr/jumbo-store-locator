export const MATCH_SCORE = {
    NO_MATCH: 0,
    CONTAINS: 1,
    PREFIX: 2,
    EXACT: 3,
} as const

export type MatchScore = typeof MATCH_SCORE[keyof typeof MATCH_SCORE]

export const scoreText = (text: string, query: string): MatchScore => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return MATCH_SCORE.EXACT

    const normalizedText = text.toLowerCase()
    if (normalizedText === normalizedQuery) return MATCH_SCORE.EXACT
    if (normalizedText.startsWith(normalizedQuery)) return MATCH_SCORE.PREFIX
    if (normalizedText.includes(normalizedQuery)) return MATCH_SCORE.CONTAINS
    return MATCH_SCORE.NO_MATCH
}
