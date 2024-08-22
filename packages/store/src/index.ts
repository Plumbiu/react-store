/* eslint-disable @stylistic/indent */
/* eslint-disable @stylistic/no-extra-semi */
import { useSyncExternalStore } from 'react'

type Listeners = Set<Function>
interface State {
  [key: string | number | symbol]: any
}
type ReturnStoreType<T> = [
  (listener: Function) => () => void,
  (selector?: keyof T) => T,
]

interface Config<T> {
  propsAreEqual?: (prevState: T, nextState: T) => boolean
  shouldUpdate?: (state: T) => boolean
  afterUpdate?: (state: T) => void
}

function isEqual(source: State, target: State) {
  for (const key in target) {
    if (!Object.is(source[key], target[key])) {
      return false
    }
  }
  return true
}

export function createStore<T extends State>(
  state: T & ThisType<T & { $set: (state: Partial<T>) => void }>,
  config?: Config<T>,
): ReturnStoreType<T> {
  const listeners: Listeners = new Set()
  function set(origin: Partial<T>) {
    if (isEqual(origin, state)) {
      return
    }
    const assigned = Object.assign({}, state, origin)
    if (config?.propsAreEqual?.(state, assigned)) {
      return
    }
    state = assigned
    if (config?.shouldUpdate && !config.shouldUpdate(assigned)) {
      return
    }
    listeners.forEach((fn) => fn())
    config?.afterUpdate?.(assigned)
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
      return selector ? state : state[selector!]
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
