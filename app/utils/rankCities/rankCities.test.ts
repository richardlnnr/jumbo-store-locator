import { describe, expect, it } from 'vitest'

import type { CityAggregate } from '../aggregateCities/aggregateCities'
import { rankCities } from './rankCities'

const cityAggregate = (city: string): CityAggregate => ({ city, state: 'Province' })

describe('rankCities', () => {
    it('Should return aggregates as-is when the query is empty', () => {
        const cities = [cityAggregate('Amsterdam'), cityAggregate('Helmond')]

        expect(rankCities(cities, '')).toEqual(cities)
    })

    it('Should rank a city whose name starts with the query above cities that only match through their stores', () => {
        const cities = [cityAggregate('Emmen'), cityAggregate('Groningen'), cityAggregate('Helmond')]
        const ranked = rankCities(cities, 'Helm')

        expect(ranked[0]?.city).toBe('Helmond')
    })

    it('Should preserve input order between cities that tie on score', () => {
        const cities = [cityAggregate('Emmen'), cityAggregate('Groningen')]
        const ranked = rankCities(cities, 'Helm')

        expect(ranked.map(aggregate => aggregate.city)).toEqual(['Emmen', 'Groningen'])
    })

    it('Should be case-insensitive when scoring', () => {
        const cities = [cityAggregate('AMSTERDAM'), cityAggregate('Helmond')]
        const ranked = rankCities(cities, 'amst')

        expect(ranked[0]?.city).toBe('AMSTERDAM')
    })
})
