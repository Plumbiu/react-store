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
  const data = useStore(personStore)
  console.log('re-render')
  return (
    <>
      <div>name: {data.name}</div>
      <Child />
    </>
  )
}
