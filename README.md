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

```js
const usePersonStore = createStore(
  {
    age: 21,
    name: 'foo',
    async changeAge(age: number) {
      this.$set({ age })
    },
    changeName() {
      this.$set({ name: this.name + '-' })
    },
  },
  ,
)
// key for localStorage
usePersonStore.$use(persist({ key: 'person', age: 30000 }))
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

# Use `createStoreFactory` api to customize the store method

```ts
import { createStoreFactory } from '@plumbiu/react-store'

const createImmerStore = (state) =>
  createStoreFactory(state, (prevState, nextState) =>
    Object.assign({}, prevState, cnextStateb),
  )
```

For example `createImmerStore` API with typescript support:

```ts
import { createStoreFactory, type BaseState } from '@plumbiu/react-store'
import { produce, type Draft } from 'immer'

type $ImmerSet<T extends BaseState> = (cb: (draft: Draft<T>) => void) => void

const createImmerStore = <T extends BaseState>(state: State<T, $ImmerSet<T>>) =>
  createStoreFactory<T, (draft: Draft<T>) => void>(state, produce)
```
