import type { JumboStore } from '../../shared/types/store'

export const supermarketFixture: JumboStore = {
    storeId: '3126',
    name: 'Jumbo Eindhoven Nederlandplein',
    complexNumber: 33079,
    websiteURL: 'https://www.jumbo.com/winkel/eindhoven/jumbo-eindhoven-nederlandplein',
    facilities: {
        cookingStudio: false,
        dryCleaning: false,
        flowers: true,
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
        wifi: true,
    },
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
    openingHours: {
        monday: { opensAt: '08:00+01:00', closesAt: '21:00+01:00' },
        tuesday: { opensAt: '08:00+01:00', closesAt: '21:00+01:00' },
        wednesday: { opensAt: '08:00+01:00', closesAt: '21:00+01:00' },
        thursday: { opensAt: '08:00+01:00', closesAt: '21:00+01:00' },
        friday: { opensAt: '08:00+01:00', closesAt: '21:00+01:00' },
        saturday: { opensAt: '08:00+01:00', closesAt: '21:00+01:00' },
        sunday: { opensAt: '10:00+01:00', closesAt: '20:00+01:00' },
    },
}

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
