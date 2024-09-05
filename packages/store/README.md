# @plumbiu/react-store

> Less than 1kb glob state management implement

# Usage

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

# Plugin

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
  // key for localStorage
  persist({ key: 'person', age: 30000 }),
)
```

## composePlugin

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
  // key for localStorage
  composePlugin(plugin1(), plugin2(), plugin3()),
)
```

## Custom

Plugin build with four hooks:

- `setup(state) => void`: init state
- `propsAreEqual(prevProps, nextProps)`：if return `true`, state will not update and react will not re-render
- `shouldUpdate(nextProps)`：state has updated, if return `true`, react will not re-render
- `afterUpdate(nextProps)`: after re-render

**Simple: only render even numbers**

```tsx
import { createStore } from '@plumbiu/react-store'
const useNumStore = createStore(
  {
    num: 2,
    inc() {
      this.$set({ num: this.num + 1 })
    },
  },
  {
    shouldUpdate({ num }) {
      return num % 2 === 0
    },
  },
)

export default function App() {
  const data = useNumStore()
  return (
    <>
      <div>name: {data.num}</div>
      <button onClick={data.inc}>inc</button>
    </>
  )
}
```
