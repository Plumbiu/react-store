export type Listener<T extends BaseState> = (prevState: T, state: T) => void
export type ListenerFn<T extends BaseState> = () => Listener<T>
export interface BaseState {
  [key: string | number | symbol]: any
}

export interface Plugin<T extends BaseState> {
  setup?: (state: T, plugin?: Plugin<T>) => void
  propsAreEqual?: (prevState: T, nextState: T) => boolean
  shouldUpdate?: (state: T) => boolean
  afterUpdate?: (state: T) => void
}
