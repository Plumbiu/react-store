# @plumbiu/react-store

> 小于 1kb 的 React 全局管理工具

# 使用方法

## 简单的例子

首先创建一个 Store：

```ts
import { createStore } from '@plumbiu/react-store'

export const countStore = createStore({
  count: 15,
  inc() {
    this.$set({ count: this.count + 1 })
  },
})
```

接着使用 `useStore` 获取数据：

```tsx
import { useStore } from '@plumbiu/react-store'
import { countStore } from './store'

export default function App() {
  const { count, inc } = useStore(personStore)
  return (
    <>
      <div>count: {count}</div>
      <buttton onClick={inc}>inc</buttton>
    </>
  )
}
```

## 最佳实践

有时候我们会在一个 `Store` 定义多个数据，如果按照上面的写法，那么 React 会全局订阅，导致即使我们使用到的局部数据未发生变化，但是全局订阅依旧会导致刷新，所以我们最好为 `useStore` 传递第二个参数，来获取具体存储的值：

```js
// Bad some Times
const { count } = useStore(countStore)
// GOOD
const count = useStore(countStore, 'count')
```

**一个 Store 同时存储着 `age` 和 `name` 两个属性**

```ts
import { createStore } from '@plumbiu/react-store'
export const personStore = createStore({
  age: 21,
  name: 'foo',
  changeAge() {
    this.$set({ age: this.age + 1 })
  },
  changeName() {
    this.$set({ name: this.name + '---' })
  },
})
```

使用：

```tsx
import { useStore } from '@plumbiu/react-store'
import { personStore } from './store'

function Child() {
  const data = useStore(personStore)
  return (
    <>
      <div>age: {data.age}</div>
      <button onClick={data.changeAge}>change age</button>
    </>
  )
}

export default function App() {
  const name = useStore(personStore, 'name')
  return (
    <>
      <div>name: {name}</div>
      <Child />
    </>
  )
}
```

# 生命周期

`@plumbiu/react-store` 目前提供了四个生命周期：

```ts
interface State {
  [key: ObjectKey]: any
}
interface Config<T> {
  propsAreEqual?: (prevState: T, nextState: T) => boolean
  shouldUpdate?: (state: T) => boolean
  afterUpdate?: (state: T) => void
}
```

生命周期按照顺序：

- `propsAreEqual`：两个 `props` 是否相等，如果返回 `true`，那么该函数什么都不会做（包括数据更新和重新渲染）
- `shouldUpdate`：是否重新渲染
- `afterUpdate`：已经重新渲染完成

举一个简单的例子：只渲染偶数

```tsx
const numStore = createStore(
  {
    num: 2,
    inc() {
      this.$set({ num: this.num + 1 })
    },
  },
  {
    shouldUpdate(_, { num }) {
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

# TODO

- [ ] 插件系统
