import './index.css'
import Basic from './components/Basic'
import Immer from './components/Immer'
import Persit from './components/Persist'
import Listener from './components/Listener'

const components = {
  basic: <Basic />,
  immer: <Immer />,
  persit: <Persit />,
  listener: <Listener />,
}

export default function App() {
  return Object.entries(components).map(([key, cmp]) => {
    return (
      <div key={key} data-test={key} className="title">
        <h1>{key}</h1>
        {cmp}
      </div>
    )
  })
}
