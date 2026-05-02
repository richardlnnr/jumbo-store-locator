import type { StoreFacilities } from '../../../shared/types/store'

const SKIP_PROPS: ReadonlySet<keyof StoreFacilities> = new Set(['locationType'])
const SKIP_VALUES: ReadonlySet<string> = new Set(['NO_INFO', 'NONE'])

export const getStoreFacilityChips = (facilities: StoreFacilities): string[] =>
    Object.entries(facilities).flatMap(([prop, value]) => {
        if (SKIP_PROPS.has(prop as keyof StoreFacilities)) return []
        if (typeof value === 'boolean') {
            return value ? [`facilities.${prop}`] : []
        }
        if (typeof value === 'string' && !SKIP_VALUES.has(value)) {
            return [`facilities.${prop}.${value.toLowerCase()}`]
        }
        return []
    })
