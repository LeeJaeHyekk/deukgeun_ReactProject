// ============================================================================
// 디바운스 훅
// ============================================================================

import { useState, useEffect, useCallback } from "react"

// 디바운스 훅 옵션
export interface UseDebounceOptions {
  delay?: number
  leading?: boolean
  trailing?: boolean
}

// 디바운스 훅 반환 타입
export interface UseDebounceReturn<T> {
  value: T
  debouncedValue: T
  setValue: (value: T) => void
  isDebouncing: boolean
}

// 디바운스 훅
export function useDebounce<T>(
  initialValue: T,
  options: UseDebounceOptions = {}
): UseDebounceReturn<T> {
  const { delay = 500, leading = false, trailing = true } = options

  const [value, setValue] = useState<T>(initialValue)
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue)
  const [isDebouncing, setIsDebouncing] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (leading && !isDebouncing) {
      setDebouncedValue(value)
      setIsDebouncing(true)
    }

    if (trailing) {
      timeoutId = setTimeout(() => {
        setDebouncedValue(value)
        setIsDebouncing(false)
      }, delay)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [value, delay, leading, trailing, isDebouncing])

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue)
    setIsDebouncing(true)
  }, [])

  return {
    value,
    debouncedValue,
    setValue: updateValue,
    isDebouncing,
  }
}

// 디바운스 유틸리티 함수
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void; flush: () => void } {
  const { leading = false, trailing = true } = options
  let timeoutId: NodeJS.Timeout | undefined
  let lastArgs: unknown[] | undefined
  let lastThis: unknown
  let lastCallTime: number | undefined

  const debounced = function (this: unknown, ...args: unknown[]) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timeoutId === undefined) {
        if (leading) {
          invokeFunc(time)
        } else {
          startTimer(delay, time)
        }
      }
    } else if (timeoutId === undefined) {
      startTimer(delay, time)
    }
  } as T & { cancel: () => void; flush: () => void }

  function startTimer(pendingDelay: number, time: number) {
    if (trailing) {
      timeoutId = setTimeout(() => invokeFunc(time), pendingDelay)
    }
  }

  function invokeFunc(time: number) {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = undefined
    lastThis = undefined
    lastCallTime = undefined
    timeoutId = undefined

    if (args) {
      func.apply(thisArg, args)
    }
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - (lastCallTime || 0)
    return lastCallTime === undefined || timeSinceLastCall >= delay
  }

  debounced.cancel = function () {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    lastArgs = undefined
    lastThis = undefined
    lastCallTime = undefined
    timeoutId = undefined
  }

  debounced.flush = function () {
    return timeoutId === undefined ? undefined : invokeFunc(Date.now())
  }

  return debounced
}

// 디바운스된 콜백 훅
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void; flush: () => void } {
  return useCallback(debounce(callback, delay, options), [
    callback,
    delay,
    options.leading,
    options.trailing,
  ])
}
