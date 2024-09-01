import { createStore } from '@plumbiu/react-store'
import { persistPlugin } from '@plumbiu/react-store/plugins'

export const personStore = createStore(
  {
    age: 21,
    name: 'foo',
    async changeAge(age: number) {
      this.$set({ age: age })
    },
    changeName() {
      this.$set({ name: this.name + '-' })
    },
  },
  [persistPlugin({ key: 'person' })],
)
