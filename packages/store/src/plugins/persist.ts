import { Config } from '..'

interface PersistConfig {
  key: string
  age?: number
}

interface Store<T> {
  lastModified: number
  data: T
}

function persistPlugin<T = any>(config: PersistConfig): Config<T> {
  const { age = 30000, key } = config

  return {
    setup() {
      let store: string | null | Store<T> = localStorage.getItem(key)
      if (store === null) {
        return
      }
      store = JSON.parse(store) as Store<T>
      const now = Date.now()
      if (now - store.lastModified > age) {
        return null
      }

      return store.data
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
