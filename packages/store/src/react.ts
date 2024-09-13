/* eslint-disable @stylistic/no-confusing-arrow */
/* eslint-disable @stylistic/semi-style */
/* eslint-disable @stylistic/indent */
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
  const initialState = state
  const listeners = new Set<Listener<T>>()
  const propsAreEqualFn: RequiredPlugin['propsAreEqual'][] = [is]
  const shouldUpdateFn: RequiredPlugin['shouldUpdate'][] = []
  const afterUpdateFn: RequiredPlugin['afterUpdate'][] = []
  const loopCallback = (fn: Function) => fn(prevState, state)

  let prevState = state
  const emitChanges = () => listeners.forEach(loopCallback)

  // Put loop in next microtask
  Promise.resolve().then(() => {
    const set = (param: P) => {
      const nextState = produce(state, param)
      if (propsAreEqualFn.some((fn) => fn(state, nextState))) {
        return
      }
      prevState = state
      state = nextState
      if (shouldUpdateFn.every(loopCallback)) {
        emitChanges()
        afterUpdateFn.forEach(loopCallback)
      }
    }
    ;(state as any).$set = set
    for (const key in state) {
      let fn = state[key]
      if (typeof fn === 'function') {
        ;(state[key] as any) = (...args: any[]) => fn.apply(state, args)
      }
    }
  })

  returnFn.$subscribe = (listener: Listener<T>) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
  returnFn.$getState = (selector?: keyof T) =>
    selector ? state[selector] : state
  returnFn.$getInitialState = () => initialState
  returnFn.$use = ({
    setup,
    propsAreEqual,
    shouldUpdate,
    afterUpdate,
  }: TPlugin) => {
    setup?.(state)
    propsAreEqual && propsAreEqualFn.push(propsAreEqual)
    shouldUpdate && shouldUpdateFn.push(shouldUpdate)
    afterUpdate && afterUpdateFn.push(afterUpdate)
  }
  returnFn.$setState = (param: Partial<T>) => assign(state, param)
  returnFn.$update = emitChanges

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
