import { useSyncExternalStore } from 'react'

type SyncExternalStoreParams = Parameters<typeof useSyncExternalStore>
export type Listener = Parameters<SyncExternalStoreParams[0]>[0]
export interface State {
  [key: string | number | symbol]: any
}
export type ReturnStoreType<T> = [
  (listener: Listener) => () => void,
  (selector?: keyof T) => T,
]

export interface Plugin<T extends State> {
  setup?: (state: T, plugin?: Plugin<T>) => void
  propsAreEqual?: (prevState: T, nextState: T) => boolean
  shouldUpdate?: (state: T) => boolean
  afterUpdate?: (state: T) => void
}
