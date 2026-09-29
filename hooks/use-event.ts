import {useCallback, useRef} from 'react'

type AnyFunction = (...args: any[]) => any

export function useEvent<F extends AnyFunction>(fn: F): F {
  const fnRef = useRef(fn)
  fnRef.current = fn

  return useCallback(function memoFunction(
    ...args: Parameters<F>
  ): ReturnType<F> {
    return fnRef.current(...args)
  }, []) as F
}
