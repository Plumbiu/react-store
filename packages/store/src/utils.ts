import type { State, Plugin } from './types'

export function isEqual(source: State, target: State) {
  for (const key in target) {
    if (!Object.is(source[key], target[key])) {
      return false
    }
  }
  return true
}

const composeRestArgs = (fn: Function | undefined, args: any[]) => fn?.(...args)

export function composePlugin<T extends State>(
  plugins?: Plugin<T>[],
): Plugin<T> {
  if (!plugins) {
    return {}
  }
  return plugins.reduce((prev, curr) => {
    return {
      setup(...args) {
        composeRestArgs(prev.setup, args)
        composeRestArgs(curr.setup, args)
      },
      propsAreEqual: (...args) =>
        !!(
          composeRestArgs(prev.propsAreEqual, args) &&
          composeRestArgs(curr.propsAreEqual, args)
        ),
      shouldUpdate: (...args) =>
        !!(
          composeRestArgs(prev.shouldUpdate, args) &&
          composeRestArgs(curr.shouldUpdate, args)
        ),
      afterUpdate(...args) {
        composeRestArgs(prev.afterUpdate, args)
        composeRestArgs(curr.afterUpdate, args)
      },
    }
  })
}
