import { createStore } from '@plumbiu/react-store'

export const personStore = createStore({
  age: 21,
  name: 'foo',
  async changeAge() {
    return { age: this.age + 1 }
  },
  changeName() {
    return { name: this.name + '-' }
  },
})
