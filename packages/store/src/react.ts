/* eslint-disable @stylistic/semi-style */
/* eslint-disable @stylistic/indent */
import { Draft, produce } from 'immer'
import { Plugin, BaseState } from './types'
import { createStoreFactory } from './factory'

export const createStore = <T extends BaseState>(
  _state: T & ThisType<T & { $set: (state: Partial<T>) => void }>,
  plugin?: Plugin<typeof _state>,
) =>
  createStoreFactory(
    _state,
    (state, param) => Object.assign({}, state, param),
    plugin,
  )

export const createImmerStore = <T extends BaseState>(
  _state: T & ThisType<T & { $set: (cb: (draft: Draft<T>) => void) => void }>,
  plugin?: Plugin<typeof _state>,
) => createStoreFactory(_state, produce, plugin as any)
