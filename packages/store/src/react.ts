/* eslint-disable @stylistic/no-confusing-arrow */
import { Draft, produce as immerProduce } from 'immer'
import { useSyncExternalStore } from 'react'
import type { Plugin, BaseState, Listener } from './types'
import { assign, is } from './utils'

export function createStoreFactory<T extends BaseState, P>(
  state: T,
  produce: (state: T, param: P) => T,
) {
  type TPlugin = Plugin<T>
  type RequiredPlugin = Required<TPlugin>
  type StateKeys = keyof T
  type StateListener = Listener<T>

  const initialState = state
  const listeners = new Set<StateListener>()
  const afterUpdateFn: RequiredPlugin['afterUpdate'][] = []
  let prevState = state
  const loopCallback = (fn: Function) => fn(prevState, state)
  const emitChanges = () => listeners.forEach(loopCallback)

  // Put loop in next microtask
  Promise.resolve().then(() => {
    function set(param: P) {
      const nextState = produce(state, param)
      if (is(state, nextState)) {
        return
      }
      prevState = state
      state = nextState
      emitChanges()
      afterUpdateFn.forEach(loopCallback)
    }
    ;(state as any).$set = set
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
    setup?.(state)
    afterUpdate && afterUpdateFn.push(afterUpdate)
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

type $Set<T extends BaseState> = {
  (state: Partial<T>): void
}
type $ImmerSet<T extends BaseState> = (cb: (draft: Draft<T>) => void) => void
type State<T, S> = T & ThisType<T & { $set: S }>
export const createStore = <T extends BaseState>(state: State<T, $Set<T>>) =>
  createStoreFactory<T, Partial<T>>(state, assign)

export const createImmerStore = <T extends BaseState>(
  state: State<T, $ImmerSet<T>>,
) => createStoreFactory<T, (draft: Draft<T>) => void>(state, immerProduce)
