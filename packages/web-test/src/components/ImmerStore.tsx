import { useStore, createImmerStore } from '@plumbiu/react-store'

interface Info {
  info: {
    address: {
      country: string
      province?: string
    }
    age: number
  }
  changeAddress: () => void
  changeAge: () => void
}

const immerStore = createImmerStore<Info>({
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

function Child() {
  const data = useStore(immerStore)
  return (
    <>
      <div>country: {data.info.address.country}</div>
      <div>province: {data.info.address.province || 'unkown'}</div>
      <div>age: {data.info.age}</div>
      <button onClick={data.changeAddress}>change address</button>
      <button onClick={data.changeAge}>change age</button>
    </>
  )
}

export default function Immer() {
  const info = useStore(immerStore, 'info')
  return (
    <>
      <div>address: {info.address.province || 'unkown'}</div>
      <h4>Child</h4>
      <Child />
    </>
  )
}
