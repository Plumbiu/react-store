import { useStore } from '@plumbiu/react-store'
import { test } from '../store'

function Child() {
  const data = useStore(test)
  return (
    <div>
      <div>child </div>
      <button onClick={() => data.inc()}>children inc</button>
      <button onClick={() => data.changeName()}>children changeName</button>
    </div>
  )
}

export default Child
