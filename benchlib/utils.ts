import { createStore } from '@plumbiu/react-store'

export function createMultiState(n: number) {
  const state: Record<string, any> = {}
  for (let i = 0; i < n; i++) {
    state[i] = i
    state[`fn${i}`] = function () {
      this.$set({ i: i + 1 })
    }
  }
  const store = createStore(state)

  return store
}
