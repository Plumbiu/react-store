import { useStore } from '@plumbiu/react-store'
import { personStore } from './store'

function Child() {
  const data = useStore(personStore)
  return (
    <>
      <div>age: {data.age}</div>
      <button onClick={data.changeAge}>change age</button>
      <button onClick={data.changeName}>change name</button>
    </>
  )
}

export default function App() {
  const name = useStore(personStore, 'name')
  console.log('re-render')
  return (
    <>
      <div>name: {name}</div>
      <Child />
    </>
  )
}
