/* eslint-disable @stylistic/semi-style */
import { Draft } from 'immer'
import { useSyncExternalStore } from 'react'
import { BaseState, Listener, Plugin, State } from './types'
import { isEqual } from './utils'

type $SetParams<T extends BaseState> = Partial<T> | ((draft: Draft<T>) => void)

export function createStoreFactory<T extends BaseState>(
  state: State<T>,
  produce: (state: T, param: $SetParams<typeof state>) => T,
  plugin?: Plugin<typeof state>,
) {
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
