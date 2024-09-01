import Basic from './components/Basic'
import Immer from './components/ImmerStore'

const components = {
  basic: <Basic />,
  immer: <Immer />,
}

export default function App() {
  return Object.entries(components).map(([key, cmp]) => {
    return (
      <div key={key}>
        <h1>{key}</h1>
        {cmp}
      </div>
    )
  })
}
