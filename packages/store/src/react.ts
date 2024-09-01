/* eslint-disable @stylistic/semi-style */
/* eslint-disable @stylistic/indent */
import { useSyncExternalStore } from 'react'
import { Listeners, Plugin, ReturnStoreType, State } from './types'
import { modifyState } from './utils'

type Set<T extends State> = (state: Partial<T>) => void

export function createStore<T extends State>(
  state: T & ThisType<T & { $set: Set<T> }>,
  plugin?: Plugin<any>,
): ReturnStoreType<T> {
  const listeners: Listeners = new Set()
  plugin?.setup?.(state)
  ;(state as any).$set = (origin: Partial<T>) => {
    const assigned = Object.assign({}, state, origin)
    modifyState({
      assigned,
      listeners,
      state,
      mergedCallback: () => (state = assigned),
      origin,
    })
  }
  for (const key in state) {
    let fn = state[key]
    if (typeof fn === 'function') {
      ;(state[key] as any) = (...args: any[]) => fn.apply(state, args)
    }
  }

  return [
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    (selector) => {
      return selector ? state[selector] : state
    },
  ]
}

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
