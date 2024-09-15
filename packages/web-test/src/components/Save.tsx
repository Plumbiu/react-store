import { createStore, save, SaveThisType } from '@plumbiu/react-store'
import { useEffect } from 'react'

interface Data {
  value: string
  setValue: (value: string) => void
  save: () => void
  back: () => void
}

const SOME_POINT = 'some-point'

const usePersonStore = createStore<Data, SaveThisType>({
  value: '',
  setValue(value) {
    this.$set({ value })
  },
  save() {
    this.$save(SOME_POINT)
  },
  back() {
    console.log('back')

    this.$back(SOME_POINT)
  },
})

usePersonStore.$use(save())

function Child() {
  const data = usePersonStore()
  useEffect(() => {
    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyZ') {
        data.back()
      }
    })
  }, [])
  return (
    <input
      value={data.value}
      onChange={(e) => {
        const value = e.target.value
        if (value.length % 6 === 0) {
          data.save()
        }
        data.setValue(value)
      }}
    />
  )
}

export default function Save() {
  const value = usePersonStore('value')
  return (
    <>
      <div>nvalueame: {value}</div>
      <h4>Child</h4>
      <Child />
    </>
  )
}
