/* eslint-disable @stylistic/semi-style */
/* eslint-disable @stylistic/indent */
import { useSyncExternalStore } from 'react'
import { Plugin, ReturnStoreType, State } from './types'
import { createStoreFactory } from './factory'

export const createStore = <T extends State>(
  _state: T & ThisType<T & { $set: (state: Partial<T>) => void }>,
  plugin?: Plugin<typeof _state>,
) =>
  createStoreFactory(
    _state,
    (origin, state: T) => Object.assign({}, state, origin),
    plugin,
  )

export function useStore<T, K extends keyof T>(
  store: ReturnStoreType<T>,
): ReturnType<ReturnStoreType<T>[1]>
export function useStore<T, K extends keyof T>(
  store: ReturnStoreType<T>,
  selector: K,
): ReturnType<ReturnStoreType<T>[1]>[K]
export function useStore<T, K extends keyof T>(
  store: ReturnStoreType<T>,
  selector?: K,
  getServerSnapshot?: () => T,
) {
  const data = useSyncExternalStore(
    store[0],
    () => store[1](selector),
    getServerSnapshot,
  )
  return data
}
