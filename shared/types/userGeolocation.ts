export type UserLocationState = 'idle' | 'loading' | 'ready' | 'error'

export type UserLocationError
    = | 'denied'
        | 'unavailable'
        | 'timeout'
        | 'unsupported'
        | 'coarse-failed'

export type PermissionState
    = | 'unknown'
        | 'granted'
        | 'prompt'
        | 'denied'
        | 'unsupported'

export type UserLocationSource = 'precise' | 'coarse' | null
