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

usePersonStore.$use(persist({ key: 'person' }))

function Child() {
  const data = usePersonStore()
  return (
    <>
      <div>age: {data.age}</div>
      <div>name: {data.name}</div>
      <button onClick={() => data.changeAge(data.age + 1)}>change age</button>
      <button onClick={data.changeName}>change name</button>
    </>
  )
}

export default function Persist() {
  const name = usePersonStore('name')
  return (
    <>
      <div>name: {name}</div>
      <h4>Child</h4>
      <Child />
    </>
  )
}
