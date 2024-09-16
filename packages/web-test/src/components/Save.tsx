import { createStoreFactory } from '@plumbiu/react-store'
import { save, type SaveThisType } from '@plumbiu/react-store/plugins'
import { useEffect } from 'react'
import hotkeys from 'hotkeys-js'

// Generics added in ThisType
const createStore = createStoreFactory<SaveThisType>([save()])
const SOME_POINT = 'some-point'
const useInputStore = createStore({
  value: '',
  setValue(value: string) {
    this.$set({ value })
  },
  save() {
    this.$save(SOME_POINT)
  },
  back() {
    this.$back(SOME_POINT)
  },
})
function Child() {
  const data = useInputStore()
  useEffect(() => {
    hotkeys('alt+z', data.back)
    hotkeys('alt+s', data.save) // ctrl+s will trigger Chrome modal
  }, [])
  return (
    <input value={data.value} onChange={(e) => data.setValue(e.target.value)} />
  )
}

export default function Save() {
  const value = useInputStore('value')
  return (
    <>
      <div>value: {value}</div>
      <h4>Child</h4>
      <Child />
    </>
  )
}
