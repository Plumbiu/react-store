import type { State, Plugin, Listeners } from './types'

export function isEqual(source: State, target: State) {
  for (const key in target) {
    if (!Object.is(source[key], target[key])) {
      return false
    }
  }
  return true
}

export function composePlugin<T extends State>(
  plugins?: Plugin<T>[],
): Plugin<T> {
  if (!plugins) {
    return {}
  }
  return plugins.reduce((prev, curr) => {
    return {
      setup(...args) {
        prev.setup?.(...args)
        curr.setup?.(...args)
      },
      propsAreEqual: (...args) =>
        !!(prev.propsAreEqual?.(...args) && curr.propsAreEqual?.(...args)),
      shouldUpdate: (...args) =>
        !!(prev.shouldUpdate?.(...args) && curr.shouldUpdate?.(...args)),
      afterUpdate(...args) {
        prev.afterUpdate?.(...args)
        curr.afterUpdate?.(...args)
      },
    }
  })
}

interface BuildAssignParams<T extends State> {
  assigned: T
  listeners: Listeners
  plugin?: Plugin<T>
  state: T
  mergedCallback: () => void
  origin?: Partial<T>
}

export function modifyState<T extends State>({
  assigned,
  state,
  listeners,
  plugin,
  origin,
  mergedCallback,
}: BuildAssignParams<T>) {
  if (origin && isEqual(origin, state)) {
    return
  }
  if (plugin?.propsAreEqual?.(state, assigned)) {
    return
  }
  mergedCallback()
  if (plugin?.shouldUpdate && !plugin.shouldUpdate(assigned)) {
    return
  }
  listeners.forEach((fn) => fn())
  plugin?.afterUpdate?.(assigned)
}
