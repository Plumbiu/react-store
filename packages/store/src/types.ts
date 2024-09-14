export type Listener<T> = {
  (prevState: T, state: T): void
}
export type BaseKey = string | number | symbol
export type BaseState = Record<BaseKey, any>

export interface Plugin<T> {
  setup?: (state: T) => void
  afterUpdate?: (prevState: T, nextState: T) => void
}
