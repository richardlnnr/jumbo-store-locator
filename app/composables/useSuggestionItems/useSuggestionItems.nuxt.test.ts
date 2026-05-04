import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'

import type { JumboStoreFeatureCollection } from '~~/shared/types/geojson'
import {
    amsterdamCentrumFeature,
    amsterdamSouthFeature,
    buildFeature,
    buildStore,
    eindhovenFeature,
    everyDay,
    hours,
} from '~~/shared/types/store.mock'
import { useStoreLocator } from '~~/app/stores/useStoreLocator'
import { setI18nLocale } from '~~/test-utils/i18n'
import { mountWithUApp } from '~~/test-utils/mountWithUApp'
import { useSuggestionItems } from './useSuggestionItems'

const seedThreeStores = () => {
    const locator = useStoreLocator()
    locator.featureCollection = {
        type: 'FeatureCollection',
        features: [eindhovenFeature, amsterdamCentrumFeature, amsterdamSouthFeature],
    } satisfies JumboStoreFeatureCollection
    return locator
}

const buildHarness = async () => {
    const captured: { ref: ReturnType<typeof useSuggestionItems> | null } = { ref: null }
    const Harness = defineComponent({
        setup() {
            captured.ref = useSuggestionItems()
            return () => h('div')
        },
    })
    await mountWithUApp(Harness)
    if (!captured.ref) throw new Error('Composable did not run')
    return captured.ref
}

describe('useSuggestionItems', () => {
    beforeEach(async () => {
        const locator = useStoreLocator()
        locator.featureCollection = null
        locator.clearFilters()
        locator.clearSelection()
        await setI18nLocale('en')
    })

    it('Should return an empty array when the typing buffer is empty', async () => {
        seedThreeStores()
        const items = await buildHarness()

        expect(items.value).toEqual([])
    })

    it('Should expose a Stores group when the buffer matches stores only', async () => {
        const locator = seedThreeStores()
        const items = await buildHarness()

        locator.setSearchTerm('amsterdam')
        await nextTick()

        const kinds = items.value.map(item => item.kind)
        expect(kinds[0]).toBe('label')
        expect(kinds.filter(kind => kind === 'store').length).toBeGreaterThan(0)
        expect(kinds.includes('city')).toBe(true)
    })

    it('Should mark label and cap items as disabled so Reka skips them in keyboard navigation', async () => {
        const locator = useStoreLocator()
        const helmondHours = everyDay(hours('08:00', '22:00'))
        const helmondFeatures = Array.from({ length: 6 }, (_, index) =>
            buildFeature(buildStore(helmondHours, {
                storeId: `helmond-${index}`,
                name: `Jumbo Helmond Branch ${index}`,
                location: {
                    latitude: 51.48,
                    longitude: 5.66,
                    address: {
                        street: 'Centrumstraat',
                        houseNumber: String(index + 1),
                        postalCode: '5701AA',
                        city: 'Helmond',
                        state: 'Noord-Brabant',
                        countryCode: 'NL',
                    },
                },
            })),
        )
        locator.featureCollection = {
            type: 'FeatureCollection',
            features: helmondFeatures,
        } satisfies JumboStoreFeatureCollection

        const items = await buildHarness()
        locator.setSearchTerm('helmond')
        await nextTick()

        const labelItem = items.value.find(item => item.kind === 'label')
        expect(labelItem).toBeDefined()
        expect(labelItem?.disabled).toBe(true)

        const capItem = items.value.find(item => item.kind === 'cap')
        expect(capItem).toBeDefined()
        expect(capItem?.disabled).toBe(true)
    })

    it('Should localize section labels via the i18n key search-autocomplete.group-stores', async () => {
        const locator = seedThreeStores()
        const items = await buildHarness()

        locator.setSearchTerm('amsterdam')
        await nextTick()

        const storeLabel = items.value.find(item => item.kind === 'label')
        expect(storeLabel?.label).toBe('Stores')
    })

    it('Should append a Cities group after the Stores group when both have matches', async () => {
        const locator = seedThreeStores()
        const items = await buildHarness()

        locator.setSearchTerm('amsterdam')
        await nextTick()

        const labels = items.value
            .filter(item => item.kind === 'label')
            .map(item => item.label)
        expect(labels).toEqual(['Stores', 'Cities'])
    })
})
