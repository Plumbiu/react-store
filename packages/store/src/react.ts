/* eslint-disable @stylistic/no-confusing-arrow */
/* eslint-disable @stylistic/semi-style */
/* eslint-disable @stylistic/indent */
import { Draft, produce as immerProduce } from 'immer'
import { useSyncExternalStore } from 'react'
import type { Plugin, BaseState, Listener } from './types'
import { assign, shllow } from './utils'

export function createStoreFactory<T extends BaseState, P>(
  state: T,
  produce: (state: T, param: P) => T,
) {
  type TPlugin = Plugin<T>
  const initialState = state
  const listeners = new Set<Listener<T>>()
  let propsAreEqualFn: TPlugin['propsAreEqual']
  let shouldUpdateFn: TPlugin['shouldUpdate']
  let afterUpdateFn: TPlugin['afterUpdate']

  const set = (param: P) => {
    const nextState = produce(state, param)
    if (propsAreEqualFn?.(state, nextState) || shllow(state, nextState)) {
      return
    }
    const prevState = state
    state = nextState
    if (shouldUpdateFn && !shouldUpdateFn(nextState)) {
      return
    }
    listeners.forEach((fn) => fn(prevState, state))
    afterUpdateFn?.(nextState)
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
  returnFn.$setState = set
  returnFn.$use = ({
    setup,
    propsAreEqual,
    shouldUpdate,
    afterUpdate,
  }: TPlugin) => {
    setup?.(state)
    if (propsAreEqual) {
      const prePropsAreEqual = propsAreEqualFn
      propsAreEqualFn = (...args) =>
        !!(prePropsAreEqual?.(...args) && propsAreEqual?.(...args))
    }
    if (shouldUpdate) {
      const preShouldUpdate = shouldUpdateFn
      shouldUpdateFn = (...args) =>
        !!(preShouldUpdate?.(...args) && shouldUpdate?.(...args))
    }
    if (afterUpdate) {
      const preAfterUpdate = afterUpdateFn
      afterUpdateFn = (...args) => {
        preAfterUpdate?.(...args)
        afterUpdate?.(...args)
      }
    }
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
export const createStore = <T extends BaseState>(state: State<T, $Set<T>>) =>
  createStoreFactory<T, Partial<T>>(state, assign)

export const createImmerStore = <T extends BaseState>(
  state: State<T, $ImmerSet<T>>,
) => createStoreFactory<T, (draft: Draft<T>) => void>(state, immerProduce)
