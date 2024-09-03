import { Draft } from 'immer'
import { useSyncExternalStore } from 'react'

type SyncExternalStoreParams = Parameters<typeof useSyncExternalStore>
export type Listener = Parameters<SyncExternalStoreParams[0]>[0]
export interface BaseState {
  [key: string | number | symbol]: any
}
export type State<T extends BaseState> = T &
  ThisType<
    T & {
      $set: (
        state: Partial<T>,
      ) => void | ((cb: (draft: Draft<T>) => void) => void)
    }
  >
export interface Plugin<T extends BaseState> {
  setup?: (state: T, plugin?: Plugin<T>) => void
  propsAreEqual?: (prevState: T, nextState: T) => boolean
  shouldUpdate?: (state: T) => boolean
  afterUpdate?: (state: T) => void
}
