import { createStore, save, SaveThisType } from '@plumbiu/react-store'

interface Info {
  name: string
  age: number
  changeAge: (age: number) => void
  changeName: () => void
  save: (point: string) => void
  back: (point: string) => void
}

const usePersonStore = createStore<Info, SaveThisType>({
  age: 21,
  name: 'foo',
  changeAge(age: number) {
    this.$set({ age })
  },
  changeName() {
    this.$set({ name: this.name + '-' })
  },
  save(point: string) {
    this.$save(point)
  },
  back(point: string) {
    this.$back(point)
  },
})

usePersonStore.$use(save())

function Child() {
  const data = usePersonStore()
  return (
    <>
      <div>age: {data.age}</div>
      <div>name: {data.name}</div>
      <button onClick={() => data.changeAge(data.age + 1)}>change age</button>
      <button onClick={data.changeName}>change name</button>
      <button onClick={() => data.save('some-point')}>save</button>
      <button onClick={() => data.back('some-point')}>back</button>
    </>
  )
}

export default function Save() {
  const name = usePersonStore('name')
  return (
    <>
      <div>name: {name}</div>
      <h4>Child</h4>
      <Child />
    </>
  )
}
