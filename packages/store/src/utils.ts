import type { BaseState } from './types'

export const assign = <T extends BaseState>(state: T, param: Partial<T>): T =>
  Object.assign({}, state, param)

export const is = Object.is
