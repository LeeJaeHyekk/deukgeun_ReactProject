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
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void; flush: () => void } {
  const { leading = false, trailing = true } = options
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let lastArgs: any[] | undefined
  let lastCallTime: number | undefined

  const debounced = function (...args: any[]) {
    const now = Date.now()
    const isInvoking = lastCallTime === undefined || now - lastCallTime >= delay

    lastArgs = args
    lastCallTime = now

    if (isInvoking) {
      if (!timeoutId && leading) {
        invokeFunc()
      } else {
        startTimer()
      }
    } else if (!timeoutId) {
      startTimer()
    }
  } as T & { cancel: () => void; flush: () => void }

  function startTimer() {
    if (trailing) {
      timeoutId = setTimeout(() => invokeFunc(), delay)
    }
  }

  function invokeFunc() {
    if (lastArgs) {
      func(...lastArgs)
      lastArgs = undefined
    }
    timeoutId = undefined
  }

  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = undefined
    lastArgs = undefined
    lastCallTime = undefined
  }

  debounced.flush = () => {
    if (timeoutId) {
      invokeFunc()
    }
  }

  return debounced
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
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
