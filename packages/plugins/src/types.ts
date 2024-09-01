export interface Plugin<T> {
  setup?: (state: T) => void
  propsAreEqual?: (prevState: T, nextState: T) => boolean
  shouldUpdate?: (state: T) => boolean
  afterUpdate?: (state: T) => void
}
