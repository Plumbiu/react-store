import { createStoreFactory } from '@plumbiu/react-store'
import { save, type SaveThisType } from '@plumbiu/react-store/plugins'
import { useEffect, useRef } from 'react'
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
  const start = useRef(Date.now())
  useEffect(() => {
    hotkeys('alt+z', data.back)
  }, [])
  return (
    <input
      value={data.value}
      onBlur={() => {
        start.current = Date.now()
        data.save()
      }}
      onChange={(e) => {
        const now = Date.now()
        if (now - start.current > 200) {
          start.current = now
          data.save()
        }
        data.setValue(e.target.value)
      }}
    />
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
