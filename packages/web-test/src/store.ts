import { createStore } from '@plumbiu/react-store'

export const test = createStore('test', {
  name: 'fasd',
  count: 1,
  inc() {
    return { count: this.count + 1 }
  },
  changeName() {
    return { name: this.name + 'f' }
  },
})

export const personStore = createStore('person', {
  age: 21,
  name: 'foo',
  changeAge() {
    return { age: this.age + 1 }
  },
  changeName() {
    return { name: this.name + '-' }
  },
})
