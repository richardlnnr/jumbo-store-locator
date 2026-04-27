export type StoreLocationType
    = 'HUB'
        | 'PICK_UP_POINT'
        | 'SPK'
        | 'SUPERMARKET'
        | 'SUPERMARKET_PICK_UP_POINT'
        | 'VIRTUAL'

export type StoreParking = 'FREE' | 'NO_INFO' | 'PAID' | 'ZONE'

export type StorePickUpType = 'INSIDE' | 'NONE' | 'OUTSIDE'

export type StoreOpeningDay
    = 'monday'
        | 'tuesday'
        | 'wednesday'
        | 'thursday'
        | 'friday'
        | 'saturday'
        | 'sunday'

export interface StoreOpeningWindow {
    opensAt: string
    closesAt: string
}

export type StoreOpeningHours = Record<StoreOpeningDay, StoreOpeningWindow>

export interface StoreFacilities {
    cookingStudio: boolean
    dryCleaning: boolean
    flowers: boolean
    kitchen: boolean
    liquorService: boolean
    locationType: StoreLocationType
    parking: StoreParking
    pharmacy: boolean
    photoService: boolean
    pickUpType: StorePickUpType
    postOffice: boolean
    selfCheckout: boolean
    selfScan: boolean
    wifi: boolean
}

export interface StoreAvailabilityWindow {
    startsOn: string
    endsOn: string
}

export interface StoreCommerceChannel {
    available: boolean
    availability: StoreAvailabilityWindow
}

export interface StoreCommerce {
    inStore: StoreCommerceChannel
    homeDelivery: StoreCommerceChannel
    collection: StoreCommerceChannel
}

export interface StoreAddress {
    street: string
    houseNumber: string
    postalCode: string
    city: string
    state: string
    countryCode: string
}

export interface StoreLocation {
    latitude: number
    longitude: number
    address: StoreAddress
}

export interface JumboStore {
    storeId: string
    name: string
    complexNumber: number
    websiteURL: string
    facilities: StoreFacilities
    commerce: StoreCommerce
    location: StoreLocation
    openingHours: StoreOpeningHours
}

export interface JumboStoresFile {
    stores: JumboStore[]
}
