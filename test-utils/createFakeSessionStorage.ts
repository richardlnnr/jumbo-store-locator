export const createFakeSessionStorage = (): Storage => {
    const data = new Map<string, string>()
    return {
        getItem: (key: string): string | null => data.get(key) ?? null,
        setItem: (key: string, value: string): void => {
            data.set(key, value)
        },
        removeItem: (key: string): void => {
            data.delete(key)
        },
        clear: (): void => {
            data.clear()
        },
        get length(): number {
            return data.size
        },
        key: (index: number): string | null => Array.from(data.keys())[index] ?? null,
    }
}
