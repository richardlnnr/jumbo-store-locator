import type {
    Coordinate,
    JumboStore,
    StoreOpeningDay,
    StoreOpeningHours,
    StoreOpeningWindow,
} from './store'

// --- Coordinate fixtures ---------------------------------------------------

export const AMSTERDAM: Coordinate = { latitude: 52.3676, longitude: 4.9041 }
export const ROTTERDAM: Coordinate = { latitude: 51.9244, longitude: 4.4777 }
export const SYDNEY: Coordinate = { latitude: -33.8688, longitude: 151.2093 }

// At Amsterdam latitude (~52 degrees), 1 degree of latitude is about 111 km.
// The offsets below give roughly the labelled distance and are used to
// exercise the meter/kilometer cutover and the meter rounding step without
// depending on exact reference values.
export const NEARBY_AMSTERDAM_500M: Coordinate = {
    latitude: AMSTERDAM.latitude + 0.0045,
    longitude: AMSTERDAM.longitude,
}
export const NEARBY_AMSTERDAM_990M: Coordinate = {
    latitude: AMSTERDAM.latitude + 0.0089,
    longitude: AMSTERDAM.longitude,
}
export const NEARBY_AMSTERDAM_1_2KM: Coordinate = {
    latitude: AMSTERDAM.latitude + 0.0108,
    longitude: AMSTERDAM.longitude,
}

// --- Opening-hours builders ------------------------------------------------

const TIMEZONE_OFFSET = '+01:00'

export const hours = (opensAt: string, closesAt: string): StoreOpeningWindow => ({
    opensAt: `${opensAt}${TIMEZONE_OFFSET}`,
    closesAt: `${closesAt}${TIMEZONE_OFFSET}`,
})

export const everyDay = (window: StoreOpeningWindow): StoreOpeningHours => ({
    monday: window,
    tuesday: window,
    wednesday: window,
    thursday: window,
    friday: window,
    saturday: window,
    sunday: window,
})

export const weekHours = (partial: Partial<Record<StoreOpeningDay, StoreOpeningWindow>>): StoreOpeningHours =>
    partial as StoreOpeningHours

// --- JumboStore factory ----------------------------------------------------

const defaultFacilities = {
    cookingStudio: false,
    dryCleaning: false,
    flowers: false,
    kitchen: false,
    liquorService: false,
    locationType: 'SUPERMARKET',
    parking: 'FREE',
    pharmacy: false,
    photoService: false,
    pickUpType: 'NONE',
    postOffice: false,
    selfCheckout: false,
    selfScan: false,
    wifi: false,
} as const

const defaultCommerce = {
    inStore: {
        available: true,
        availability: { startsOn: '2020-01-01T00:00:00Z', endsOn: '9999-12-31T00:00:00Z' },
    },
    homeDelivery: {
        available: false,
        availability: { startsOn: '2020-01-01T00:00:00Z', endsOn: '9999-12-31T00:00:00Z' },
    },
    collection: {
        available: false,
        availability: { startsOn: '2020-01-01T00:00:00Z', endsOn: '9999-12-31T00:00:00Z' },
    },
} as const

const defaultLocation = {
    latitude: 52,
    longitude: 5,
    address: {
        street: 'Test',
        houseNumber: '1',
        postalCode: '0000AA',
        city: 'TEST',
        state: 'Test',
        countryCode: 'NL',
    },
} as const

export const buildStore = (openingHours: StoreOpeningHours, overrides: Partial<JumboStore> = {}): JumboStore => ({
    storeId: 'test-store',
    name: 'Test Store',
    complexNumber: 1,
    websiteURL: 'https://example.test',
    facilities: { ...defaultFacilities },
    commerce: {
        inStore: { ...defaultCommerce.inStore, availability: { ...defaultCommerce.inStore.availability } },
        homeDelivery: { ...defaultCommerce.homeDelivery, availability: { ...defaultCommerce.homeDelivery.availability } },
        collection: { ...defaultCommerce.collection, availability: { ...defaultCommerce.collection.availability } },
    },
    location: { ...defaultLocation, address: { ...defaultLocation.address } },
    openingHours,
    ...overrides,
})

// --- Concrete JumboStore fixtures ------------------------------------------

export const openEveryDayStore: JumboStore = buildStore(everyDay(hours('08:00', '22:00')))

export const supermarketFixture: JumboStore = buildStore(
    weekHours({
        monday: hours('08:00', '21:00'),
        tuesday: hours('08:00', '21:00'),
        wednesday: hours('08:00', '21:00'),
        thursday: hours('08:00', '21:00'),
        friday: hours('08:00', '21:00'),
        saturday: hours('08:00', '21:00'),
        sunday: hours('10:00', '20:00'),
    }),
    {
        storeId: '3126',
        name: 'Jumbo Eindhoven Nederlandplein',
        complexNumber: 33079,
        websiteURL: 'https://www.jumbo.com/winkel/eindhoven/jumbo-eindhoven-nederlandplein',
        facilities: { ...defaultFacilities, flowers: true, wifi: true },
        commerce: {
            inStore: {
                available: true,
                availability: { startsOn: '2014-08-26T22:00:00Z', endsOn: '9999-12-31T00:00:00Z' },
            },
            homeDelivery: {
                available: true,
                availability: { startsOn: '2019-10-22T00:00:00Z', endsOn: '9999-12-31T00:00:00Z' },
            },
            collection: {
                available: false,
                availability: { startsOn: '2020-01-01T00:00:00Z', endsOn: '2020-01-31T00:00:00Z' },
            },
        },
        location: {
            latitude: 51.479272,
            longitude: 5.46338,
            address: {
                street: 'Nederlandplein',
                houseNumber: '103',
                postalCode: '5628AJ',
                city: 'EINDHOVEN',
                state: 'Noord-Brabant',
                countryCode: 'NL',
            },
        },
    },
)

export const virtualFixture: JumboStore = {
    ...supermarketFixture,
    storeId: '8970',
    name: 'Jumbo Veghel Bezorgservice Eindhoven',
    complexNumber: 89070,
    facilities: { ...supermarketFixture.facilities, locationType: 'VIRTUAL' },
    location: {
        latitude: 51.43434,
        longitude: 5.51235,
        address: { ...supermarketFixture.location.address, city: 'VEGHEL' },
    },
}
