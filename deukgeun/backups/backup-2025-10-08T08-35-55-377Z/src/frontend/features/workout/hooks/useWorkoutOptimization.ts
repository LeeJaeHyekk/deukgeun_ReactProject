import { useCallback, useRef, useEffect, useMemo } from 'react'
import { useState } from 'react'

// 디바운스 훅
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay)
    },
    [callback, delay]
  ) as T
}

// 스로틀 훅
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0)
  const lastCallTimer = useRef<NodeJS.Timeout>()

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCall.current >= delay) {
        callback(...args)
        lastCall.current = now
      } else {
        if (lastCallTimer.current) {
          clearTimeout(lastCallTimer.current)
        }
        lastCallTimer.current = setTimeout(
          () => {
            callback(...args)
            lastCall.current = Date.now()
          },
          delay - (now - lastCall.current)
        )
      }
    },
    [callback, delay]
  ) as T
}

// 로컬 스토리지 훅
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue] as const
}

// 세션 스토리지 훅
export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue] as const
}

// 인터섹션 옵저버 훅
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const elementRef = useRef<Element | null>(null)

  const callback = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries
    setIsIntersecting(entry.isIntersecting)
    setEntry(entry)
  }, [])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(callback, options)
    observer.observe(element)

    return () => observer.disconnect()
  }, [callback, options])

  return [elementRef, isIntersecting, entry] as const
}

// 윈도우 리사이즈 훅
export function useWindowResize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

// 키보드 이벤트 훅
export function useKeyboardEvent(
  key: string,
  callback: (event: KeyboardEvent) => void,
  options: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        const { ctrl, shift, alt } = options
        if (
          (!ctrl || event.ctrlKey) &&
          (!shift || event.shiftKey) &&
          (!alt || event.altKey)
        ) {
          callback(event)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, callback, options])
}

// 클릭 외부 감지 훅
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, callback])
}

// 포커스 트랩 훅
export function useFocusTrap(enabled: boolean = true) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [enabled])

  return containerRef
}

// 가상화 훅 (대용량 리스트 최적화)
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%',
      },
    }))
  }, [items, itemHeight, containerHeight, scrollTop])

  const totalHeight = items.length * itemHeight

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    handleScroll,
  }
}

// 워크아웃 데이터 최적화 훅
export function useWorkoutDataOptimization() {
  // 자주 사용되는 데이터 메모이제이션
  const memoizedStats = useMemo(() => {
    // 통계 계산 로직
    return {
      totalWorkouts: 0,
      averageDuration: 0,
      totalCalories: 0,
      streakDays: 0,
    }
  }, [])

  // 데이터 캐싱
  const [cachedData, setCachedData] = useLocalStorage('workout-cache', {})

  // 캐시 무효화
  const invalidateCache = useCallback(() => {
    setCachedData({})
  }, [setCachedData])

  return {
    memoizedStats,
    cachedData,
    invalidateCache,
  }
}

// 성능 모니터링 훅
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const lastRenderTime = useRef(performance.now())

  useEffect(() => {
    renderCount.current += 1
    const currentTime = performance.now()
    const timeSinceLastRender = currentTime - lastRenderTime.current
    lastRenderTime.current = currentTime

    if (import.meta.env.MODE === 'development') {
      console.log(
        `${componentName} rendered ${renderCount.current} times. Time since last render: ${timeSinceLastRender.toFixed(2)}ms`
      )
    }
  })

  return {
    renderCount: renderCount.current,
  }
}
