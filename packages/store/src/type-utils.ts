import { BaseState } from './types'

type OmitNever<T> = Pick<
  T,
  {
    [key in keyof T]: T[key] extends never ? never : key
  }[keyof T]
>

export type CollectThisType<T extends BaseState> = OmitNever<{
  [key in keyof T]: key extends `$${string}` ? never : T[key]
}> &
  ThisType<T>
