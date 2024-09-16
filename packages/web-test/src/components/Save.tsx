import { createStore } from '@plumbiu/react-store'
import { save } from '@plumbiu/react-store/plugins'
import { useEffect } from 'react'
import hotkeys from 'hotkeys-js'

interface Data {
  value: string
  setValue: (value: string) => void
  save: () => void
  back: () => void
  $save: (point: string) => void
  $back: (point: string) => void
}

const SOME_POINT = 'some-point'

const usePersonStore = createStore<Data>({
  value: '',
  setValue(value) {
    this.$set({ value })
  },
  save() {
    this.$save(SOME_POINT)
  },
  back() {
    this.$back(SOME_POINT)
  },
})

usePersonStore.$use(save())

function Child() {
  const data = usePersonStore()
  useEffect(() => {
    hotkeys('alt+z', data.back)
    hotkeys('alt+s', data.save) // ctrl+s will trigger Chrome modal
  }, [])
  return (
    <input value={data.value} onChange={(e) => data.setValue(e.target.value)} />
  )
}

export default function Save() {
  const value = usePersonStore('value')
  return (
    <>
      <div>value: {value}</div>
      <h4>Child</h4>
      <Child />
    </>
  )
}
