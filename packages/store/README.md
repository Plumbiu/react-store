# @plumbiu/react-store

> Less than 1kb glob state management implement

```tsx
import { createStore } from '@plumbiu/react-store'

const useCountStore = createStore({
  count: 15,
  inc() {
    this.$set({ count: this.count + 1 })
  },
})

export default function App() {
  const { count, inc } = useCountStore()
  // or use selector, it will avoid global subscriptions
  // const count = useCountStore('count')
  // const inc = useCountStore('inc')
  return (
    <>
      <div>count: {count}</div>
      <buttton onClick={inc}>inc</buttton>
    </>
  )
}
```

# Immer

You can use `createImmerStore` api to reduce the nested structures:

```jsx
const useImmerStore = createImmerStore({
  info: {
    address: {
      country: 'china',
    },
    age: 18,
  },
  changeAddress() {
    this.$set((draft) => {
      draft.info.address.province = 'hangzhou'
    })
  },
  changeAge() {
    this.$set((draft) => {
      draft.info.age++
    })
  },
})
```

# Reading/writing state and reacting to changes outside of React Components

Sometimes we need access state outside React Components.

```js
const store = createStore({ name: 'foo' })
// non-reactive fresh state
store.$getState() // { name: 'foo' }
// Updateding state outside component
store.$setState({ name: 'bar' })
store.$getState() // { name: 'bar' }
// Geting the initial state
store.$getInitialState() // { name: 'foo' }
// Updating state will trigger the listener
const unsub = store.$subscribe(console.log)
// Unscribe the listener
unsub()
```

# Use `$use` api add plugin

## persit

Cache data in localStorage:

```js
import { createStore } from '@plumbiu/react-store'
import { persist } from '@plumbiu/react-store/plugins'

const usePersonStore = createStore({
  age: 21,
  name: 'foo',
  async changeAge(age: number) {
    this.$set({ age })
  },
  changeName() {
    this.$set({ name: this.name + '-' })
  },
})
// key for localStorage
usePersonStore.$use(persist({ key: 'person', age: 30000 }))
```

## save

This is useful for some scenarios where you need to withdraw, such as withdrawing text in an input box.

```tsx
import { createStore } from '@plumbiu/react-store'
import { save } from '@plumbiu/react-store/plugins'
import { useEffect } from 'react'
import hotkeys from 'hotkeys-js'

interface Data {
  value: string
  setValue: (value: string) => void
  save: () => void
  back: () => void
  // Properties starting with $ are considered ThisType
  $save: (point: string) => void
  $back: (point: string) => void
}

const SOME_POINT = 'some-point'
const useInputStore = createStore<Data>({
  value: '',
  setValue(value) {
    this.$set({ value })
  },
  save() {
    this.$save(SOME_POINT)
  },
  back() {
    this.$back(SOME_POINT)
  },
})

useInputStore.$use(save())

function App() {
  const data = useInputStore()
  useEffect(() => {
    hotkeys('alt+z', data.back)
    hotkeys('alt+s', data.save) // ctrl+s will trigger Chrome modal
  }, [])
  return (
    <input value={data.value} onChange={(e) => data.setValue(e.target.value)} />
  )
}
```

## Global Plugin

If you think it is troublesome to use the `$use` method to add plugins to `createStore` every time, you can create a custom createStore using a factory function.

For example, this `save` plugin:

```ts
import { createStoreFactory } from '@plumbiu/react-store'
import { save, type SaveThisType } from '@plumbiu/react-store/plugins'

// Generics added in ThisType
const createStore = createStoreFactory<SaveThisType>([save()])
const SOME_POINT = 'some-point'
const useInputStore = createStore({
  value: '',
  setValue(value: string) {
    this.$set({ value })
  },
  save() {
    this.$save(SOME_POINT)
  },
  back() {
    this.$back(SOME_POINT)
  },
})
```

## Custom plugin

```ts
export interface Plugin<T> {
  // init state
  setup?: (state: T) => void
  // after re-render
  afterUpdate?: (prevState: T, nextState: T) => void
}
```

**Simple persist**

```js
const store = createStore({
  age: '18',
  changeName() {
    this.$set({ age: this.age + 1 })
  },
})

const KEY = 'custom-plugin'
store.$use({
  setup(state) {
    const localStore = localStore.getItem(KEY)
    if (store === null) {
      return
    }
    const data = JSON.parse(localStore)
    for (const key in data) {
      state[key] = data[key]
    }
  },
  afterUpdate(_, nextState) {
    localStorage.setItem(KEY, JSON.stringify(nextState))
  },
})
```
