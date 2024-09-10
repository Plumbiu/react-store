/* eslint-disable @stylistic/no-confusing-arrow */
/* eslint-disable @stylistic/semi-style */
/* eslint-disable @stylistic/indent */
import { Draft, produce as immerProduce } from 'immer'
import { useSyncExternalStore } from 'react'
import type { Plugin, BaseState, Listener } from './types'
import { assign, shllow } from './utils'

export function createStoreFactory<T extends BaseState, S, P>(
  state: T,
  produce: (state: T, param: P) => T,
) {
  type TPlugin = Plugin<T>
  type RequiredPlguin = Required<TPlugin>

  const initialState = state
  const listeners = new Set<Listener<T>>()
  const shouldUpdates: RequiredPlguin['shouldUpdate'][] = []
  const propsAreEquals: RequiredPlguin['propsAreEqual'][] = []
  const afterUpdates: RequiredPlguin['afterUpdate'][] = []
  const set = (param: P) => {
    const nextState = produce(state, param)
    if (
      propsAreEquals.some((fn) => fn(state, nextState) === true) ||
      shllow(state, nextState)
    ) {
      return
    }
    const prevState = state
    state = nextState
    if (shouldUpdates.some((fn) => fn(nextState) === false)) {
      return
    }
    listeners.forEach((fn) => fn(prevState, state))
    for (const afterUpdate of afterUpdates) {
      afterUpdate(nextState)
    }
  }
  ;(state as any).$set = set
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
  returnFn.$use = ({
    setup,
    propsAreEqual,
    shouldUpdate,
    afterUpdate,
  }: TPlugin) => {
    setup?.(state)
    propsAreEqual && propsAreEquals.push(propsAreEqual)
    shouldUpdate && shouldUpdates.push(shouldUpdate)
    afterUpdate && afterUpdates.push(afterUpdate)
  }

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
export const createStore = <T extends BaseState>(_state: State<T, $Set<T>>) =>
  createStoreFactory<T, $Set<T>, Partial<T>>(_state, assign)

export const createImmerStore = <T extends BaseState>(
  _state: State<T, $ImmerSet<T>>,
) =>
  createStoreFactory<T, $ImmerSet<T>, (draft: Draft<T>) => void>(
    _state,
    immerProduce,
  )
