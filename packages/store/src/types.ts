export type Listeners = Set<Function>
export interface State {
  [key: string | number | symbol]: any
}
export type ReturnStoreType<T> = [
  (listener: Function) => () => void,
  (selector?: keyof T) => T,
]

export interface Config<T> {
  setup?: (state: T) => void
  propsAreEqual?: (prevState: T, nextState: T) => boolean
  shouldUpdate?: (state: T) => boolean
  afterUpdate?: (state: T) => void
}
