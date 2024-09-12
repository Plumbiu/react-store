import type { BaseState } from './types'

export const assign = <T extends BaseState>(state: T, param: Partial<T>): T =>
  Object.assign({}, state, param)

const is = Object.is
export const shallow = <T>(source: T, target: T): boolean => {
  if (is(source, target)) {
    return true
  }
  for (const key in target) {
    if (source[key] !== target[key]) {
      return false
    }
  }

  return true
}
