import type { State, Plugin } from './types'

export function isEqual(source: State, target: State) {
  for (const key in target) {
    if (!Object.is(source[key], target[key])) {
      return false
    }
  }
  return true
}

export function composePlugins<T extends State>(
  configs?: Plugin<T>[],
): Plugin<T> {
  if (!configs) {
    return {}
  }
  return configs.reduce((prev, curr) => {
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
