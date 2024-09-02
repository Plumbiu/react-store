import { Draft } from 'immer'

export type Listeners = Set<Function>
export interface State {
  [key: string | number | symbol]: any
}
export type ReturnStoreType<T> = [
  (listener: Function) => () => void,
  (selector?: keyof T) => T,
]

export interface Plugin<T extends State> {
  setup?: (state: T) => void
  propsAreEqual?: (prevState: T, nextState: T) => boolean
  shouldUpdate?: (state: T) => boolean
  afterUpdate?: (state: T) => void
}

export type $Immer<T extends State> = (cb: (draft: Draft<T>) => void) => void
export type $Set<T extends State> = (state: Partial<T>) => void
