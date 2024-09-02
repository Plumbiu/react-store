import { useStore, createStore, persist } from '@plumbiu/react-store'

const personStore = createStore(
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
  persist({ key: 'person' }),
)

function Child() {
  const data = useStore(personStore)
  return (
    <>
      <div>age: {data.age}</div>
      <button onClick={() => data.changeAge(data.age + 1)}>change age</button>
      <button onClick={data.changeName}>change name</button>
    </>
  )
}

export default function Persist() {
  const name = useStore(personStore, 'name')
  console.log('re-render')
  return (
    <>
      <div>name: {name}</div>
      <h4>Child</h4>
      <Child />
    </>
  )
}
