/* eslint-disable @stylistic/semi-style */
import { Draft } from 'immer'
import { State, ReturnStoreType, Listener, Plugin } from './types'
import { isEqual } from './utils'

type $SetParams<T extends State> = Partial<T> | ((draft: Draft<T>) => void)

export function createStoreFactory<T extends State>(
  state: T & ThisType<T & { $set: (cb: (draft: Draft<T>) => void) => void }>,
  produce: (state: T, param: $SetParams<typeof state>) => T,
  plugin?: Plugin<typeof state>,
): ReturnStoreType<T> {
  const listeners = new Set<Listener>()
  ;(state as any).$set = (param: $SetParams<T>) => {
    const nextState = produce(state, param)
    if (isEqual(nextState, state)) {
      return
    }
    if (plugin?.propsAreEqual?.(state, nextState)) {
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

  return [
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    (selector) => {
      return selector ? state[selector] : state
    },
  ]
}
