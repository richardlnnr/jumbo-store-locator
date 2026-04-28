import type { JumboStore } from '../../shared/types/store'
import type { StoreStatus } from '../../shared/types/storeStatus'

export function getStoreStatus(_store: JumboStore, _now: Date): StoreStatus {
    throw new Error('not implemented')
}
