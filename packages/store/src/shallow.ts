import { State, ReturnStoreType, Listeners } from './types'
import { isEqual } from './utils'

export function createShallowStore<T extends State>(
  state: T & ThisType<T & { $set: (state: Partial<T>) => void }>,
): ReturnStoreType<T> {
  const listeners: Listeners = new Set()
  function set(origin: Partial<T>) {
    if (isEqual(origin, state)) {
      return
    }
    const assigned = Object.assign({}, state, origin)
    state = assigned
    listeners.forEach((fn) => fn())
  }

  ;(state as any).$set = set
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
