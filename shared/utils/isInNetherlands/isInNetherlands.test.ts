import { describe, expect, it } from 'vitest'

import { isInNetherlands } from './isInNetherlands'

describe('isInNetherlands', () => {
    it('Should accept Amsterdam', () => {
        expect(isInNetherlands({ latitude: 52.3702, longitude: 4.8952 })).toBe(true)
    })

    it('Should accept Maastricht near the southern edge', () => {
        expect(isInNetherlands({ latitude: 50.85, longitude: 5.69 })).toBe(true)
    })

    it('Should accept Groningen in the north-east', () => {
        expect(isInNetherlands({ latitude: 53.22, longitude: 6.57 })).toBe(true)
    })

    it('Should accept a point just inside the loose bbox', () => {
        expect(isInNetherlands({ latitude: 50.01, longitude: 3.01 })).toBe(true)
    })

    it('Should reject a point just south of the bbox', () => {
        expect(isInNetherlands({ latitude: 49.99, longitude: 3.01 })).toBe(false)
    })

    it('Should reject Joinville in Brazil', () => {
        expect(isInNetherlands({ latitude: -26.3033, longitude: -48.8413 })).toBe(false)
    })

    it('Should reject Berlin to the east of the bbox', () => {
        expect(isInNetherlands({ latitude: 52.52, longitude: 13.40 })).toBe(false)
    })

    it('Should accept any point inside the loose bbox even if it is technically across the border', () => {
        // Antwerp (51.22, 4.40) is in Belgium but inside the loose [3, 50, 8, 54] bbox.
        // Documenting the intentional looseness — keeps parity with the server's existing
        // store-coordinate sanity check.
        expect(isInNetherlands({ latitude: 51.22, longitude: 4.40 })).toBe(true)
    })
})
