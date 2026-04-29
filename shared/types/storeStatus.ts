export type StoreStatusKey
    = 'status.closes-at'
        | 'status.opens-today-at'
        | 'status.opens-tomorrow-at'
        | 'status.opens-on'

export interface StoreStatusNext {
    key: StoreStatusKey
    at: Date
}

export interface StoreStatus {
    isOpen: boolean
    next: StoreStatusNext | null
}
