import { describe, expect, it } from 'vitest'

import enLocale from './en.json'
import nlLocale from './nl.json'

type LocaleObject = Record<string, unknown>

const collectKeyPaths = (root: LocaleObject, prefix: string[] = []): string[] => {
    const paths: string[] = []
    for (const [key, value] of Object.entries(root)) {
        const next = [...prefix, key]
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            paths.push(...collectKeyPaths(value as LocaleObject, next))
            continue
        }
        paths.push(next.join('.'))
    }
    return paths.sort()
}

describe('locale parity', () => {
    it('Should expose the same key paths in en.json and nl.json', () => {
        const enPaths = collectKeyPaths(enLocale as LocaleObject)
        const nlPaths = collectKeyPaths(nlLocale as LocaleObject)

        const enOnly = enPaths.filter(path => !nlPaths.includes(path))
        const nlOnly = nlPaths.filter(path => !enPaths.includes(path))

        expect(enOnly).toEqual([])
        expect(nlOnly).toEqual([])
    })

    it.each([
        'privacy.title',
        'privacy.intro',
        'privacy.precise-title',
        'privacy.precise-body',
        'privacy.coarse-title',
        'privacy.coarse-body',
        'privacy.never-title',
        'privacy.never-servers',
        'privacy.never-ip',
        'privacy.never-persist',
        'privacy.never-ads',
        'privacy.control-title',
        'privacy.control-body',
        'privacy.back-link',
        'geolocation.banner-message',
        'geolocation.banner-submessage',
        'geolocation.banner-allow',
        'geolocation.banner-dismiss',
        'geolocation.banner-learn-more',
        'geolocation.blocked-note',
        'geolocation.locator-tooltip-locate',
        'geolocation.locator-tooltip-locating',
        'geolocation.locator-tooltip-blocked',
        'geolocation.locator-tooltip-retry',
        'geolocation.locator-tooltip-upgrade',
        'store-map.zoom-in',
        'store-map.zoom-out',
        'distance.km-approx',
    ])('Should define %s in both en and nl locales with non-empty strings', (path) => {
        const enValue = path.split('.').reduce<unknown>(
            (carry, segment) => (carry as Record<string, unknown> | undefined)?.[segment],
            enLocale,
        )
        const nlValue = path.split('.').reduce<unknown>(
            (carry, segment) => (carry as Record<string, unknown> | undefined)?.[segment],
            nlLocale,
        )

        expect(typeof enValue).toBe('string')
        expect(enValue).not.toBe('')
        expect(typeof nlValue).toBe('string')
        expect(nlValue).not.toBe('')
    })
})
