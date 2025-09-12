// ============================================================================
// 성능 최적화 유틸리티
// 메모이제이션, 디바운싱, 스로틀링 등 성능 최적화 도구들
// ============================================================================

import { useCallback, useMemo, useRef, useEffect, useState } from 'react'

// 디바운스 훅
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

// 스로틀 훅
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastCall = now - lastCallRef.current

      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now
        callback(...args)
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now()
          callback(...args)
        }, delay - timeSinceLastCall)
      }
    },
    [callback, delay]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttledCallback
}

// 메모이제이션된 콜백 훅
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps)
}

// 메모이제이션된 값 훅
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps)
}

// 가상화를 위한 훅
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    )
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    visibleRange,
  }
}

// 지연 로딩 훅
export function useLazyLoading<T>(
  loadFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadedRef = useRef(false)

  const load = useCallback(async () => {
    if (loadedRef.current) return data

    setLoading(true)
    setError(null)

    try {
      const result = await loadFunction()
      setData(result)
      loadedRef.current = true
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로딩 실패'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadFunction, data])

  useEffect(() => {
    load()
  }, dependencies)

  return { data, loading, error, load }
}

// 인터섹션 옵저버 훅
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<Element | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true)
      }
    }, options)

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [options, hasIntersected])

  return { ref, isIntersecting, hasIntersected }
}

// 성능 모니터링 훅
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0)
  const renderCount = useRef<number>(0)

  useEffect(() => {
    renderStartTime.current = performance.now()
    renderCount.current += 1

    return () => {
      const renderTime = performance.now() - renderStartTime.current

      if (import.meta.env.DEV) {
        console.log(`🎯 ${componentName} 렌더링:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: renderCount.current,
        })
      }
    }
  })

  return {
    renderCount: renderCount.current,
  }
}

// 메모리 사용량 모니터링
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  } | null>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        })
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000)

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// 번들 크기 최적화를 위한 동적 임포트 훅
export function useDynamicImport<T = any>(
  importFunction: () => Promise<{ default: T }>,
  fallback?: T
) {
  const [component, setComponent] = useState<T | null>(fallback || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadComponent = useCallback(async () => {
    if (component && component !== fallback) return component

    setLoading(true)
    setError(null)

    try {
      const module = await importFunction()
      setComponent(module.default)
      return module.default
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로딩 실패'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [importFunction, component, fallback])

  useEffect(() => {
    loadComponent()
  }, [loadComponent])

  return { component, loading, error, loadComponent }
}

// 이미지 최적화 훅
export function useOptimizedImage(
  src: string,
  options: {
    lazy?: boolean
    placeholder?: string
    fallback?: string
  } = {}
) {
  const { lazy = true, placeholder, fallback } = options
  const [imageState, setImageState] = useState<{
    src: string
    loading: boolean
    error: boolean
  }>({
    src: placeholder || '',
    loading: true,
    error: false,
  })

  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  })

  useEffect(() => {
    if (!lazy || isIntersecting) {
      const img = new Image()

      img.onload = () => {
        setImageState({
          src: img.src,
          loading: false,
          error: false,
        })
      }

      img.onerror = () => {
        setImageState({
          src: fallback || placeholder || '',
          loading: false,
          error: true,
        })
      }

      img.src = src
    }
  }, [src, lazy, isIntersecting, placeholder, fallback])

  return {
    ...imageState,
    ref: lazy ? ref : undefined,
  }
}

// 웹 워커 훅
export function useWebWorker<T = any>(
  workerScript: string,
  options: {
    onMessage?: (data: T) => void
    onError?: (error: Error) => void
  } = {}
) {
  const { onMessage, onError } = options
  const workerRef = useRef<Worker | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    try {
      const worker = new Worker(workerScript)

      worker.onmessage = event => {
        onMessage?.(event.data)
      }

      worker.onerror = error => {
        onError?.(new Error(error.message || 'Web Worker error'))
      }

      workerRef.current = worker
      setIsReady(true)

      return () => {
        worker.terminate()
        workerRef.current = null
        setIsReady(false)
      }
    } catch (error) {
      onError?.(error as Error)
    }
  }, [workerScript, onMessage, onError])

  const postMessage = useCallback(
    (data: any) => {
      if (workerRef.current && isReady) {
        workerRef.current.postMessage(data)
      }
    },
    [isReady]
  )

  return {
    postMessage,
    isReady,
  }
}

// 캐시 최적화 훅
export function useOptimizedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    staleWhileRevalidate?: boolean
  } = {}
) {
  const { ttl = 5 * 60 * 1000, staleWhileRevalidate = true } = options
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(
    new Map()
  )
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)

  const getCachedData = useCallback(() => {
    const cached = cacheRef.current.get(key)
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data
    }
    return null
  }, [key, ttl])

  const setCachedData = useCallback(
    (newData: T) => {
      cacheRef.current.set(key, {
        data: newData,
        timestamp: Date.now(),
      })
    },
    [key]
  )

  const fetchData = useCallback(
    async (force = false) => {
      const cached = getCachedData()

      if (cached && !force) {
        setData(cached)

        if (staleWhileRevalidate) {
          // 백그라운드에서 새 데이터 가져오기
          try {
            const freshData = await fetcher()
            setCachedData(freshData)
            setData(freshData)
          } catch (error) {
            console.warn('백그라운드 데이터 갱신 실패:', error)
          }
        }

        return cached
      }

      setLoading(true)
      try {
        const freshData = await fetcher()
        setCachedData(freshData)
        setData(freshData)
        return freshData
      } finally {
        setLoading(false)
      }
    },
    [fetcher, getCachedData, setCachedData, staleWhileRevalidate]
  )

  const invalidate = useCallback(() => {
    cacheRef.current.delete(key)
    setData(null)
  }, [key])

  return {
    data,
    loading,
    fetchData,
    invalidate,
    isStale: data
      ? Date.now() - (cacheRef.current.get(key)?.timestamp || 0) > ttl
      : false,
  }
}
