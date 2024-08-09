/* eslint-disable @stylistic/indent */
/* eslint-disable @stylistic/no-extra-semi */
import { useSyncExternalStore } from 'react'

interface State {
  [key: string | number | symbol]: any
}
type ReturnStoreType<T> = {
  $subscribe: (listener: Function) => () => void
  $getSnapshot: (selector?: keyof T) => T
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

export function createStore<T extends State>(
  name: string | Symbol,
  state: T,
  config?: Config<T>,
): ReturnStoreType<T> {
  let listeners: Function[] = []
  function emitChange() {
    for (let i = 0; i < listeners.length; i++) {
      listeners[i]()
    }
  }

  for (const key in state) {
    const fn = state[key]
    if (typeof fn !== 'function') {
      continue
    }
    try {
      ;(state[key] as any) = (action: any) => {
        const origin = fn.call(state, action) ?? {}
        if (shallowEqual(state, origin)) {
          return
        }
        const assigned = { ...state, ...origin }
        if (config?.propsAreEqual?.(state, assigned)) {
          return
        }
        state = assigned
        if (config?.shouldUpdate && !config.shouldUpdate(state)) {
          return
        }
        emitChange()
        config?.afterUpdate?.(state)
      }
    } catch (error: any) {
      console.error(`Error: ${name}\n${error.message}`)
    }
  }

  return {
    $subscribe(listener: Function) {
      listeners = listeners.concat(listener)
      return () => (listeners = listeners.filter((l) => l !== listener))
    },
    $getSnapshot(selector) {
      if (!selector) {
        return state
      }
      return state[selector]
    },
  }
}

export function useStore<T, K extends keyof T>(
  store: ReturnStoreType<T>,
): ReturnType<ReturnStoreType<T>['$getSnapshot']>
export function useStore<T, K extends keyof T>(
  store: ReturnStoreType<T>,
  selector: K,
): ReturnType<ReturnStoreType<T>['$getSnapshot']>[K]
export function useStore<T, K extends keyof T>(
  store: ReturnStoreType<T>,
  selector?: K,
) {
  const data = useSyncExternalStore(store.$subscribe, () =>
    store.$getSnapshot(selector),
  )
  return data
}
