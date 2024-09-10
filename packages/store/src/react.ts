/* eslint-disable @stylistic/no-confusing-arrow */
/* eslint-disable @stylistic/semi-style */
/* eslint-disable @stylistic/indent */
import { Draft, produce as immerProduce } from 'immer'
import { useSyncExternalStore } from 'react'
import type { Plugin, BaseState, Listener } from './types'
import { assign, shllow } from './utils'

export function createStoreFactory<T, S, P>(
  state: T,
  produce: (state: T, param: P) => T,
  _plugin?: any,
) {
  const initialState = state
  const listeners = new Set<Listener<T>>()
  const plugin = _plugin as Plugin<T>
  const set = (param: P) => {
    const nextState = produce(state, param)
    if (plugin?.propsAreEqual?.(state, nextState) || shllow(state, nextState)) {
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
  ;(state as any).$set = set
  plugin?.setup?.(state, plugin)

  for (const key in state) {
    let fn = state[key]
    if (typeof fn === 'function') {
      ;(state[key] as any) = (...args: any[]) => fn.apply(state, args)
    }
  }

  returnFn.$subscribe = (listener: Listener<T>) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
  returnFn.$getState = (selector?: keyof T) =>
    selector ? state[selector] : state
  returnFn.$getInitialState = () => initialState
  returnFn.$setState = set as S

  function returnFn(): T
  function returnFn<K extends keyof T>(selector: K): T[K]
  function returnFn<K extends keyof T>(selector?: K) {
    const data = useSyncExternalStore(
      returnFn.$subscribe,
      () => returnFn.$getState(selector),
      returnFn.$getInitialState,
    )
    return data
  }

  return returnFn
}

type $Set<T extends BaseState> = (state: Partial<T>) => void
type $ImmerSet<T extends BaseState> = (cb: (draft: Draft<T>) => void) => void
type State<T, S> = T & ThisType<T & { $set: S }>
export const createStore = <T extends BaseState, P = Plugin<T>>(
  _state: State<T, $Set<T>>,
  plugin?: P,
) => createStoreFactory<T, $Set<T>, Partial<T>>(_state, assign, plugin)

export const createImmerStore = <T extends BaseState, P = Plugin<T>>(
  _state: State<T, $ImmerSet<T>>,
  plugin?: P,
) =>
  createStoreFactory<T, $ImmerSet<T>, (draft: Draft<T>) => void>(
    _state,
    immerProduce,
    plugin,
  )
