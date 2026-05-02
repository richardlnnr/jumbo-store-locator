import { describe, expect, it } from 'vitest'

import {
    computeEasePaddingTop,
    computePopupMaxHeight,
} from './storePopupSizing'

describe('computeEasePaddingTop', () => {
    it('Should subtract the 120px viewport margin from the canvas height in the unclamped range', () => {
        expect(computeEasePaddingTop(600)).toBe(480)
    })

    it('Should clamp to the 120px floor when the canvas is shorter than 240px', () => {
        expect(computeEasePaddingTop(200)).toBe(120)
    })

    it('Should return exactly 120px at the floor threshold (canvas 240)', () => {
        expect(computeEasePaddingTop(240)).toBe(120)
    })

    it('Should clamp to the 720px ceiling when the canvas is taller than 840px', () => {
        expect(computeEasePaddingTop(2000)).toBe(720)
    })

    it('Should return exactly 720px at the ceiling threshold (canvas 840)', () => {
        expect(computeEasePaddingTop(840)).toBe(720)
    })
})

describe('computePopupMaxHeight', () => {
    it('Should subtract the 120px viewport margin from the canvas height in the unclamped range', () => {
        expect(computePopupMaxHeight(900)).toBe(780)
    })

    it('Should clamp to the 200px floor when the canvas is shorter than 320px', () => {
        expect(computePopupMaxHeight(150)).toBe(200)
    })

    it('Should return exactly 200px at the floor threshold (canvas 320)', () => {
        expect(computePopupMaxHeight(320)).toBe(200)
    })

    it('Should not impose an upper cap on tall canvases', () => {
        expect(computePopupMaxHeight(2000)).toBe(1880)
    })
})
