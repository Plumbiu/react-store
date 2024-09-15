export type Listener<T> = {
  (prevState: T, state: T): void
}
export type BaseKey = string | number | symbol
export type BaseState = Record<BaseKey, any>
export type BaseSet = <T extends BaseState>(
  nextState: T,
  isEqual?: (prevState: T, nextState: T) => boolean,
) => void

export interface Plugin<T> {
  setup?: (
    state: T,
    operation: {
      setState: BaseSet
      getState: () => T
    },
  ) => void
  afterUpdate?: (prevState: T, nextState: T) => void
}
