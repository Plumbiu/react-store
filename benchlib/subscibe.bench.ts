import { bench } from 'vitest'
import { createMultiState } from './utils'

const N = 50

const store = createMultiState(N)

bench(
  'simple set',
  () => {
    for (let i = 0; i < N; i++) {
      store.$setState({ [i]: i + 1 })
    }
  },
  {
    warmupTime: 1000,
  },
)
