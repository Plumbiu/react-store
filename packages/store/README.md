# @plumbiu/react-store

> 小于 1kb 的 React 全局管理工具

# Usage

```tsx
import { useStore, createStore } from '@plumbiu/react-store'

const countStore = createStore({
  count: 15,
  inc() {
    this.$set({ count: this.count + 1 })
  },
})

export default function App() {
  const { count, inc } = useStore(countStore)
  // or use selector, it will avoid global subscriptions
  // const count = useStore(countStore, 'count')
  // const inc = useStore(countStore, 'inc)
  return (
    <>
      <div>count: {count}</div>
      <buttton onClick={inc}>inc</buttton>
    </>
  )
}
```

# Life cycle

- `setup(state) => void`: init state
- `propsAreEqual(prevProps, nextProps)`：if return `true`, state will not update and react will not re-render
- `shouldUpdate(nextProps)`：state has updated, if return `true`, react will not re-render
- `afterUpdate(nextProps)`: after re-render

**Simple: only render even numbers**

```tsx
import { useStore, createStore } from '@plumbiu/react-store'
const numStore = createStore(
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
  const data = useStore(numStore)
  return (
    <>
      <div>name: {data.num}</div>
      <button onClick={data.inc}>inc</button>
    </>
  )
}
```
