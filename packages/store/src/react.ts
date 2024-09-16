/* eslint-disable @stylistic/indent */
/* eslint-disable @stylistic/semi-style */
/* eslint-disable @stylistic/no-confusing-arrow */
import { Draft, produce as immerProduce } from 'immer'
import { useSyncExternalStore } from 'react'
import type { Plugin, BaseState, Listener, BaseSet } from './types'
import { assign, is } from './utils'
import { CollectThisType } from './type-utils'

export function createStoreFactory<T extends CollectThisType<BaseState>, P>(
  state: T,
  produce: (state: T, param: P) => T,
  plugins: Plugin<T>[] = [],
) {
  type TPlugin = Plugin<T>
  type StateKeys = keyof T
  type StateListener = Listener<T>

  const initialState = state
  const listeners = new Set<StateListener>()
  let prevState = state
  const emitChanges = () => listeners.forEach((fn) => fn(prevState, state))
  const baseSet: BaseSet = (nextState: T, isEqual = is) => {
    if (isEqual(state, nextState)) {
      return
    }
    prevState = state
    state = nextState
    emitChanges()
    plugins.forEach(({ afterUpdate }) => afterUpdate?.(prevState, state))
  }
  const setupOperation = { setState: baseSet, getState: () => state }
  // Put loop in microtask
  Promise.resolve().then(() => {
    ;(state as any).$set = (param: P) => baseSet(produce(state, param))
    for (const { setup } of plugins) {
      setup?.(state, setupOperation)
    }
    for (const key in state) {
      let fn = state[key]
      if (typeof fn === 'function') {
        ;(state[key] as any) = (...args: any[]) => fn.apply(state, args)
      }
    }
  })

  returnFn.$subscribe = (listener: StateListener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
  returnFn.$getState = (selector?: StateKeys) =>
    selector ? state[selector] : state
  returnFn.$getInitialState = () => initialState
  returnFn.$use = ({ setup, afterUpdate }: TPlugin) => {
    setup?.(state, setupOperation)
    afterUpdate && plugins.push({ afterUpdate })
  }
  returnFn.$setState = (param: Partial<T>) => assign(state, param)
  returnFn.$render = emitChanges

  function returnFn(): T
  function returnFn<K extends StateKeys>(selector: K): T[K]
  function returnFn<K extends StateKeys>(selector?: K) {
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
type State<T extends BaseState, S> = CollectThisType<T & { $set: S }>
export const createStore = <T extends BaseState>(state: State<T, $Set<T>>) =>
  createStoreFactory<typeof state, Partial<T>>(state, assign)

export const createImmerStore = <T extends BaseState>(
  state: State<T, $ImmerSet<T>>,
) =>
  createStoreFactory<typeof state, (draft: Draft<T>) => void>(
    state,
    immerProduce,
  )
