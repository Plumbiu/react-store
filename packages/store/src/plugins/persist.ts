import type { Plugin, State } from '../types'

interface PersistConfig {
  key: string
  age?: number
}

interface Store<T> {
  lastModified: number
  data: T
}

function persistPlugin<T extends State>(config: PersistConfig): Plugin<T> {
  const { age = 30000, key } = config

  return {
    setup(state) {
      let store: string | null | Store<T> = localStorage.getItem(key)
      if (store === null) {
        return
      }
      store = JSON.parse(store) as Store<T>
      const now = Date.now()
      if (now - store.lastModified > age) {
        return
      }

      for (const key in store.data) {
        state[key] = store.data[key]
      }
    },
    afterUpdate(state) {
      localStorage.setItem(
        key,
        JSON.stringify({
          data: state,
          lastModified: Date.now(),
        }),
      )
    },
  }
}

export default persistPlugin
