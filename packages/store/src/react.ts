/* eslint-disable @stylistic/semi-style */
/* eslint-disable @stylistic/indent */
import { Draft, produce } from 'immer'
import { useSyncExternalStore } from 'react'
import { Plugin, BaseState, Listener, ListenerFn } from './types'
import { assign } from './utils'

type $SetParams<T extends BaseState> = (draft: Draft<T> | T) => void
interface ExtenralData<T extends BaseState> {
  $subscibe: ListenerFn<T>
  $getState: {
    (): T
    <K extends keyof T>(selector: K): T[K]
  }
  $getInitialState: () => T
  $setState: (state: Partial<T>) => void
}
export function createStoreFactory<T extends BaseState>(
  state: T,
  produce: (state: T, param: $SetParams<typeof state>) => T,
  plugin?: Plugin<T>,
) {
  const initialState = state
  const listeners = new Set<Listener<T>>()
  ;(state as any).$set = (param: $SetParams<T>) => {
    const nextState = produce(state, param)
    if (
      Object.is(nextState, state) ||
      plugin?.propsAreEqual?.(state, nextState)
    ) {
      return
    }
    const prevState = state
    state = nextState
    if (plugin?.shouldUpdate && !plugin.shouldUpdate(nextState)) {
      return
    }
    listeners.forEach((fn) => fn(prevState, state))
    plugin?.afterUpdate?.(nextState)
  }
  plugin?.setup?.(state, plugin)

  for (const key in state) {
    let fn = state[key]
    if (typeof fn === 'function') {
      ;(state[key] as any) = (...args: any[]) => fn.apply(state, args)
    }
  }

  const addListener = (listener: Listener<T>) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  function returnFn(): T & ExtenralData<T>
  function returnFn<K extends keyof T>(selector: K): T[K] & ExtenralData<T>
  function returnFn<K extends keyof T>(
    selector?: K,
    getServerSnapshot?: () => T,
  ) {
    const data = useSyncExternalStore(
      addListener,
      () => (selector ? state[selector] : state),
      getServerSnapshot,
    )
    return data
  }

  returnFn.$subscribe = addListener
  returnFn.$getState = () => state
  returnFn.$getInitialState = () => initialState
  returnFn.$setState = (param: Partial<T>) => assign(state, param)

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

export const createImmerStore = <T extends BaseState>(
  _state: T & ThisType<T & { $set: (cb: (draft: Draft<T>) => void) => void }>,
  plugin?: Plugin<any>,
) => createStoreFactory<T>(_state, produce, plugin)
