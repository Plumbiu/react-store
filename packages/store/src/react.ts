/* eslint-disable @stylistic/semi-style */
/* eslint-disable @stylistic/indent */
import { Draft, produce } from 'immer'
import { useSyncExternalStore } from 'react'
import { Plugin, BaseState, Listener } from './types'
import { isEqual } from './utils'

type $SetParams<T extends BaseState> = (draft: Draft<T> | T) => void

export function createStoreFactory<T extends BaseState>(
  state: T,
  produce: (state: T, param: $SetParams<typeof state>) => T,
  plugin?: Plugin<T>,
) {
  const listeners = new Set<Listener>()
  ;(state as any).$set = (param: $SetParams<T>) => {
    const nextState = produce(state, param)
    if (
      isEqual(nextState, state) ||
      plugin?.propsAreEqual?.(state, nextState)
    ) {
      return
    }
    state = nextState
    if (plugin?.shouldUpdate && !plugin.shouldUpdate(nextState)) {
      return
    }
    listeners.forEach((fn) => fn())
    plugin?.afterUpdate?.(nextState)
  }
  plugin?.setup?.(state, plugin)

  for (const key in state) {
    let fn = state[key]
    if (typeof fn === 'function') {
      ;(state[key] as any) = (...args: any[]) => fn.apply(state, args)
    }
  }

  function returnFn(): T
  function returnFn<K extends keyof T>(selector: K): T[K]
  function returnFn<K extends keyof T>(
    selector?: K,
    getServerSnapshot?: () => T,
  ) {
    const data = useSyncExternalStore(
      (listener) => {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
      () => (selector ? state[selector] : state),
      getServerSnapshot,
    )
    return data
  }

  return returnFn
}

export const createStore = <T extends BaseState>(
  _state: T & ThisType<T & { $set: (state: Partial<T>) => void }>,
  plugin?: Plugin<any>,
) =>
  createStoreFactory<T>(
    _state,
    (state, param) => Object.assign({}, state, param),
    plugin,
  )

export const createImmerStore = <T extends BaseState, P = Plugin<T>>(
  _state: T & ThisType<T & { $set: (cb: (draft: Draft<T>) => void) => void }>,
  plugin?: Plugin<any>,
) => createStoreFactory<T>(_state, produce, plugin)
