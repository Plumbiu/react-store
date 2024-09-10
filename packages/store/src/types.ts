export type Listener<T> = (prevState: T, state: T) => void
export type ListenerFn<T> = () => Listener<T>
export interface BaseState {
  [key: string | number | symbol]: any
}

export interface Plugin<T> {
  setup?: (state: T) => void
  propsAreEqual?: (prevState: T, nextState: T) => boolean
  shouldUpdate?: (state: T) => boolean
  afterUpdate?: (state: T) => void
}
