/* eslint-disable @stylistic/indent */
/* eslint-disable @stylistic/no-extra-semi */
import { useSyncExternalStore } from 'react'

type ObjectKey = string | number | symbol
type SimpleObj = Record<string, string>
interface State {
  [key: ObjectKey]: any
}
type ReturnStoreType<T, K extends keyof T> = {
  $subscribe: (listener: Function) => () => void
  $getSnapshot: (selector?: K[]) => typeof selector extends undefined
    ? T
    : {
        [key in K]: T[key]
      }
}

interface Config<T> {
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
): ReturnStoreType<T, keyof T> {
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
    $getSnapshot(selector) {
      if (selector) {
        const obj: any = {}
        for (const key in selector) {
          obj[key] = state[key]
        }
        return obj
      }
      return state
    },
  }
}

export function useStore<T extends State, K extends keyof T>(
  store: ReturnStoreType<T, K>,
  selector?: K[],
) {
  const data = useSyncExternalStore(store.$subscribe, () =>
    store.$getSnapshot(selector),
  )
  return data
}
