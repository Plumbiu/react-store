import { bench } from 'vitest'
import { createMultiState } from './utils'

bench(
  'simple create',
  () => {
    createMultiState(10000)
  },
  {
    warmupTime: 1000,
  },
)
