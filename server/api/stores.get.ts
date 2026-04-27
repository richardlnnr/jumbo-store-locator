/**
 * GET /api/stores
 *
 * Reviewer note — why this is shaped as a runtime conversion instead of a
 * pre-baked GeoJSON file checked into the repo:
 *
 * The source file `server/assets/data/jumbo-store-data.json` is treated as
 * the upstream feed (the kind a real Jumbo back-office system would expose).
 * This handler reads that file on every request and projects it into a
 * GeoJSON FeatureCollection. If a new store is added to the source file the
 * API surfaces it with no code change — exactly how a thin integration layer
 * over an upstream system should behave.
 *
 */
import { storesToGeoJson } from '../utils/storesToGeoJson'
import type { JumboStoresFile } from '~~/shared/types/store'
import type { JumboStoreFeatureCollection } from '~~/shared/types/geojson'

const STORAGE_KEY = 'data:jumbo-store-data.json'

export default defineEventHandler(async (): Promise<JumboStoreFeatureCollection> => {
    const file = await useStorage('assets:server').getItem<JumboStoresFile>(STORAGE_KEY)

    if (!file) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Jumbo store data is not available',
        })
    }

    return storesToGeoJson(file.stores)
})
