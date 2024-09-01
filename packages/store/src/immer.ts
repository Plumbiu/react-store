/* eslint-disable @stylistic/semi-style */
import { Draft, produce } from 'immer'
import type { Listeners, Plugin, ReturnStoreType, State } from './types'
import { modifyState } from './utils'

export function createImmerStore<T extends State>(
  state: T & ThisType<T & { $set: (cb: (draft: Draft<T>) => void) => void }>,
  plugin?: Plugin<any>,
): ReturnStoreType<T> {
  const listeners: Listeners = new Set()
  plugin?.setup?.(state)
  ;(state as any).$set = (cb: (draft: Draft<T>) => void) => {
    const assigned = produce(state, cb)
    modifyState({
      assigned,
      listeners,
      plugin,
      state,
      mergedCallback: () => (state = assigned),
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

export default createImmerStore
