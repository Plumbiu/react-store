/* eslint-disable @stylistic/no-extra-semi */
import { useCallback, useSyncExternalStore } from 'react'

type ObjectKey = string | number | symbol
type SimpleObj = Record<string, string>
interface State {
  [key: ObjectKey]: any
}
type ReturnStoreType<T extends State> = {
  $subscribe: (listener: Function) => () => void
  $getSnapshot: (selector?: keyof T) => T
}
interface Config<T extends State> {
  propsAreEqual?: (fnName: string, prevProps: T, nextProps: T) => boolean
  beforeUpdate?: (
    fnName: string,
    prevProps: T,
    nextProps: T,
  ) => Partial<T> | void
  shouldUpdate?: (fnName: string, props: T) => boolean
  afterUpdate?: (fnName: string, props: T) => void
}

function shallowEqual(source: SimpleObj, target: SimpleObj) {
  for (const key in target) {
    if (source[key] !== target[key]) {
      return false
    }
  }
  return true
}

export function createStore<T extends State>(
  name: string | Symbol,
  state: T,
  config?: Config<T>,
): ReturnStoreType<typeof state> {
  let listeners: Function[] = []
  function emitChange() {
    for (let i = 0; i < listeners.length; i++) {
      listeners[i]()
    }
  }

  const shouldUpate = config?.shouldUpdate ? config.shouldUpdate : () => true

  for (const key in state) {
    const fn = state[key]
    if (typeof fn !== 'function') {
      continue
    }
    const fnName = fn.name

    try {
      ;(state[key] as any) = (action: any) => {
        const result = fn.call(state, action) ?? {}

        if (shallowEqual(state, result)) {
          return
        }
        const assignObj = { ...state, ...result }
        if (config?.propsAreEqual?.(fnName, result, assignObj)) {
          return
        }
        const updatedResult = config?.beforeUpdate?.(fnName, state, assignObj)
        if (updatedResult) {
          state = { ...state, ...updatedResult }
        } else {
          state = assignObj
        }
        if (!shouldUpate(fnName, state)) {
          return
        }
        emitChange()
        config?.afterUpdate?.(fnName, state)
      }
    } catch (error) {
      console.error(`Error: ${name}-${fnName}`)
    }
  }

  const $subscribe = (listener: Function) => {
    listeners = listeners.concat(listener)
    return () => (listeners = listeners.filter((l) => l !== listener))
  }

  return {
    $subscribe,
    $getSnapshot(selector?: keyof typeof state) {
      if (selector) {
        return state[selector]
      }
      return state
    },
  }
}

type SnapshotReturnType<T extends ReturnStoreType<State>> = ReturnType<
  T['$getSnapshot']
>
export function useStore<T extends State>(
  store: ReturnStoreType<T>,
): SnapshotReturnType<typeof store>
export function useStore<T extends State, U extends keyof T>(
  store: ReturnStoreType<T>,
  selector: U,
): SnapshotReturnType<typeof store>[U]
export function useStore<T extends State>(
  store: ReturnStoreType<T>,
  selector?: keyof SnapshotReturnType<typeof store>,
) {
  const getSnapshot = useCallback(
    () => store.$getSnapshot(selector),
    [selector],
  )

  const data = useSyncExternalStore(store.$subscribe, getSnapshot)
  return data
}
