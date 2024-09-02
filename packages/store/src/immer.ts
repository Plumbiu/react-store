/* eslint-disable @stylistic/semi-style */
import { Draft, produce } from 'immer'
import type { Plugin, State } from './types'
import { createStoreFactory } from './factory'

export const createImmerStore = <T extends State>(
  _state: T & ThisType<T & { $set: (cb: (draft: Draft<T>) => void) => void }>,
  plugin?: Plugin<typeof _state>,
) =>
  createStoreFactory(_state, (cb: any, state: T) => produce(state, cb), plugin)

export default createImmerStore
