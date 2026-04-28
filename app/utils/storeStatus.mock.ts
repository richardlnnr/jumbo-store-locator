import type {
    JumboStore,
    StoreOpeningDay,
    StoreOpeningHours,
    StoreOpeningWindow,
} from '../../shared/types/store'

const TZ_OFFSET = '+01:00'

export function hours(opensAt: string, closesAt: string): StoreOpeningWindow {
    return {
        opensAt: `${opensAt}${TZ_OFFSET}`,
        closesAt: `${closesAt}${TZ_OFFSET}`,
    }
}

export function everyDay(window: StoreOpeningWindow): StoreOpeningHours {
    return {
        monday: window,
        tuesday: window,
        wednesday: window,
        thursday: window,
        friday: window,
        saturday: window,
        sunday: window,
    }
}

export function weekHours(partial: Partial<Record<StoreOpeningDay, StoreOpeningWindow>>): StoreOpeningHours {
    return partial as StoreOpeningHours
}

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
    latitude: 52.0,
    longitude: 5.0,
    address: {
        street: 'Test',
        houseNumber: '1',
        postalCode: '0000AA',
        city: 'TEST',
        state: 'Test',
        countryCode: 'NL',
    },
} as const

export function buildStore(openingHours: StoreOpeningHours, overrides: Partial<JumboStore> = {}): JumboStore {
    return {
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
    }
}
