import { createStore } from '@plumbiu/react-store'

export const personStore = createStore({
  age: 21,
  name: 'foo',
  async changeAge(age: number) {
    this.$set({ age: age })
  },
  changeName() {
    this.$set({ name: this.name + '-' })
  },
})
