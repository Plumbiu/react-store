/* eslint-disable @stylistic/indent */
/* eslint-disable @stylistic/no-extra-semi */
import { useSyncExternalStore } from 'react'

interface State {
  [key: string | number | symbol]: any
}
type ReturnStoreType<T> = {
  $s: (listener: Function) => () => void
  $g: (selector?: keyof T) => T
}

interface Config<T> {
  propsAreEqual?: (prevState: T, nextState: T) => boolean
  shouldUpdate?: (state: T) => boolean
  afterUpdate?: (state: T) => void
}

function shallowEqual(source: State, target: State) {
  for (const key in target) {
    if (!Object.is(source[key], target[key])) {
      return false
    }
  }
  return true
}

function emitChange(listeners: Function[]) {
  for (let i = 0; i < listeners.length; i++) {
    listeners[i]()
  }
}
const AsyncFunction = async function () {}.constructor

function afterCall<T extends State>(
  state: T,
  config: Config<T> | undefined,
  origin: any,
  listeners: Function[],
  cb: (assigned: T) => void,
) {
  if (shallowEqual(state, origin)) {
    return
  }
  const assigned = { ...state, ...origin }
  if (config?.propsAreEqual?.(state, assigned)) {
    return
  }
  cb(assigned)
  if (config?.shouldUpdate && !config.shouldUpdate(assigned)) {
    return
  }
  emitChange(listeners)
  config?.afterUpdate?.(assigned)
}

export function createStore<T extends State>(
  state: T,
  config?: Config<T>,
): ReturnStoreType<T> {
  let listeners: Function[] = []

  const cb = (assigned: T) => {
    state = assigned
  }
  for (const key in state) {
    let fn = state[key]
    if (typeof fn !== 'function') {
      continue
    }
    if (fn.constructor === AsyncFunction) {
      ;(state[key] as any) = async (action: any) => {
        const origin = (await fn.call(state, action)) ?? {}
        afterCall(state, config, origin, listeners, cb)
      }
    } else {
      ;(state[key] as any) = (action: any) => {
        const origin = fn.call(state, action) ?? {}
        afterCall(state, config, origin, listeners, cb)
      }
    }
  }

  return {
    $s(listener: Function) {
      listeners = listeners.concat(listener)
      return () => (listeners = listeners.filter((l) => l !== listener))
    },
    $g(selector) {
      if (!selector) {
        return state
      }
      return state[selector]
    },
  }
}

export function useStore<T, K extends keyof T>(
  store: ReturnStoreType<T>,
): ReturnType<ReturnStoreType<T>['$g']>
export function useStore<T, K extends keyof T>(
  store: ReturnStoreType<T>,
  selector: K,
): ReturnType<ReturnStoreType<T>['$g']>[K]
export function useStore<T, K extends keyof T>(
  store: ReturnStoreType<T>,
  selector?: K,
  getServerSnapshot?: () => T,
) {
  const data = useSyncExternalStore(
    store.$s,
    () => store.$g(selector),
    getServerSnapshot,
  )
  return data
}
