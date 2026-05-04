export interface HighlightSegment {
    text: string
    bold: boolean
}

export const highlightMatch = (text: string, query: string): HighlightSegment[] => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery || !text) {
        return [{ text, bold: false }]
    }

    const lowerText = text.toLowerCase()
    const lowerQuery = trimmedQuery.toLowerCase()
    const queryLength = lowerQuery.length

    const segments: HighlightSegment[] = []
    let cursor = 0

    while (cursor < text.length) {
        const matchIndex = lowerText.indexOf(lowerQuery, cursor)
        if (matchIndex === -1) {
            segments.push({ text: text.slice(cursor), bold: false })
            break
        }

        if (matchIndex > cursor) {
            segments.push({ text: text.slice(cursor, matchIndex), bold: false })
        }
        segments.push({ text: text.slice(matchIndex, matchIndex + queryLength), bold: true })
        cursor = matchIndex + queryLength
    }

    return segments.length === 0 ? [{ text, bold: false }] : segments
}
