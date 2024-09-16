/* eslint-disable @stylistic/semi-style */
import type { Plugin, BaseState, BaseKey } from '../types'

export interface SaveThisType {
  $save: (point: string) => void
  $back: (point: string) => void
}

function savePlugin<T extends BaseState>(): Plugin<T> {
  const saveMap = new Map<BaseKey, T>()
  return {
    setup(state, { setState, getState }) {
      ;(state as any).$save = (point: string) => saveMap.set(point, getState())
      ;(state as any).$back = (point: string) => {
        const oldValue = saveMap.get(point)
        if (oldValue) {
          setState(oldValue)
        }
      }
    },
  }
}

export default savePlugin
