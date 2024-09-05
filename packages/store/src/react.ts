/* eslint-disable @stylistic/no-confusing-arrow */
/* eslint-disable @stylistic/semi-style */
/* eslint-disable @stylistic/indent */
import { Draft, produce } from 'immer'
import { useSyncExternalStore } from 'react'
import { Plugin, BaseState, Listener } from './types'
import { assign } from './utils'

type Produce<T extends BaseState> =
  | ((state: T, param: Partial<T>) => T)
  | ((state: T, param: (draft: Draft<T>) => void) => T)
type $Set<T extends BaseState> = (state: Partial<T>) => void
type $ImmerSet<T extends BaseState> = (cb: (draft: Draft<T>) => void) => void
export function createStoreFactory<T extends BaseState>(
  state: T,
  produce: Produce<T>,
  plugin?: Plugin<T>,
) {
  const initialState = state
  const listeners = new Set<Listener<T>>()
  ;(state as any).$set = (param: Partial<T> & ((draft: Draft<T>) => void)) => {
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

  returnFn.$subscribe = addListener
  returnFn.$getState = (selector?: keyof T) =>
    selector ? state[selector] : state
  returnFn.$getInitialState = () => initialState
  returnFn.$setState = (param: Partial<T>) => assign(state, param)

  function returnFn(): T
  function returnFn<K extends keyof T>(selector: K): T[K]
  function returnFn<K extends keyof T>(selector?: K) {
    const data = useSyncExternalStore(
      addListener,
      () => returnFn.$getState(selector),
      returnFn.$getInitialState,
    )
    return data
  }

  return returnFn
}

export const createStore = <T extends BaseState>(
  _state: T & ThisType<T & { $set: $Set<T> }>,
  plugin?: Plugin<any>,
) => createStoreFactory<T>(_state, assign, plugin)

export const createImmerStore = <T extends BaseState>(
  _state: T & ThisType<T & { $set: $ImmerSet<T> }>,
  plugin?: Plugin<any>,
) => createStoreFactory<T>(_state, produce, plugin)
