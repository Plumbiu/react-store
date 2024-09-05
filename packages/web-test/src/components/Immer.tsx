import { createImmerStore } from '@plumbiu/react-store'

interface Info {
  info: {
    data: {
      name: string
      age: number
    }
  }
  changeName: () => void
  changeAge: () => void
}

const useImmerStore = createImmerStore<Info>({
  info: {
    data: {
      name: 'foo',
      age: 21,
    },
  },
  changeName() {
    this.$set((draft) => {
      draft.info.data.name += '-'
    })
  },
  changeAge() {
    this.$set((draft) => {
      draft.info.data.age++
    })
  },
})

function Child() {
  const data = useImmerStore()
  return (
    <>
      <div>age: {data.info.data.age}</div>
      <div>name: {data.info.data.name}</div>
      <button onClick={data.changeAge}>change age</button>
      <button onClick={data.changeName}>change name</button>
    </>
  )
}

export default function Immer() {
  const info = useImmerStore('info')
  return (
    <>
      <div>name: {info.data.name}</div>
      <h4>Child</h4>
      <Child />
    </>
  )
}
