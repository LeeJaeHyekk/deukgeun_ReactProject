// ============================================================================
// 최적화된 API 훅
// 캐싱, 재시도, 성능 모니터링을 포함한 통합 API 관리
// ============================================================================

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import type {
  OptimizedApiResponse,
  OptimizedLoadingState,
  OptimizedErrorState,
  OptimizedCacheConfig,
  OptimizedCacheEntry,
  OptimizedPerformanceMetrics,
} from '../types/optimized'

// 기본 설정
const DEFAULT_CACHE_CONFIG: OptimizedCacheConfig = {
  duration: 5 * 60 * 1000, // 5분
  maxSize: 100,
  strategy: 'memory',
}

const DEFAULT_RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
}

// 캐시 관리 클래스
class OptimizedCacheManager<T> {
  private cache = new Map<string, OptimizedCacheEntry<T>>()
  private config: OptimizedCacheConfig

  constructor(config: OptimizedCacheConfig = DEFAULT_CACHE_CONFIG) {
    this.config = config
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // 만료 체크
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    // 접근 횟수 증가
    entry.accessCount++
    return entry.data
  }

  set(key: string, data: T): void {
    // 캐시 크기 제한
    if (this.cache.size >= (this.config.maxSize || 100)) {
      this.evictLeastUsed()
    }

    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.config.duration,
      accessCount: 1,
    })
  }

  clear(): void {
    this.cache.clear()
  }

  private evictLeastUsed(): void {
    let leastUsedKey = ''
    let leastUsedCount = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < leastUsedCount) {
        leastUsedCount = entry.accessCount
        leastUsedKey = key
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey)
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
    }
  }

  private calculateHitRate(): number {
    const totalAccess = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.accessCount,
      0
    )
    return totalAccess > 0 ? totalAccess / this.cache.size : 0
  }
}

// 성능 모니터링 클래스
class OptimizedPerformanceMonitor {
  private metrics: OptimizedPerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    apiCallTime: 0,
    cacheHitRate: 0,
  }

  private timers = new Map<string, number>()

  startTimer(name: string): void {
    this.timers.set(name, performance.now())
  }

  endTimer(name: string): number {
    const startTime = this.timers.get(name)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    this.timers.delete(name)

    // 메트릭 업데이트
    switch (name) {
      case 'apiCall':
        this.metrics.apiCallTime = duration
        break
      case 'render':
        this.metrics.renderTime = duration
        break
      case 'load':
        this.metrics.loadTime = duration
        break
    }

    return duration
  }

  updateCacheHitRate(hitRate: number): void {
    this.metrics.cacheHitRate = hitRate
  }

  getMetrics(): OptimizedPerformanceMetrics {
    return { ...this.metrics }
  }

  reset(): void {
    this.metrics = {
      loadTime: 0,
      renderTime: 0,
      apiCallTime: 0,
      cacheHitRate: 0,
    }
    this.timers.clear()
  }
}

// 재시도 로직
async function withRetry<T>(
  operation: () => Promise<T>,
  config = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < config.maxAttempts) {
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt - 1),
          config.maxDelay
        )
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}

// API 상태 타입
interface OptimizedApiState<T>
  extends OptimizedLoadingState,
    OptimizedErrorState {
  data: T | null
  lastUpdated: number | null
  cacheKey: string | null
}

// 최적화된 API 훅
export function useOptimizedApi<T = any>(
  apiFunction: () => Promise<OptimizedApiResponse<T>>,
  options: {
    cacheKey?: string
    cacheConfig?: OptimizedCacheConfig
    retryConfig?: typeof DEFAULT_RETRY_CONFIG
    immediate?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
    dependencies?: any[]
  } = {}
) {
  const {
    cacheKey,
    cacheConfig = DEFAULT_CACHE_CONFIG,
    retryConfig = DEFAULT_RETRY_CONFIG,
    immediate = true,
    onSuccess,
    onError,
    dependencies = [],
  } = options

  // 상태 관리
  const [state, setState] = useState<OptimizedApiState<T>>({
    isLoading: false,
    isRefreshing: false,
    isInitialLoading: false,
    error: null,
    retryCount: 0,
    lastErrorTime: undefined,
    data: null,
    lastUpdated: null,
    cacheKey: null,
  })

  // 캐시 및 성능 모니터링 인스턴스
  const cacheManager = useMemo(
    () => new OptimizedCacheManager<T>(cacheConfig),
    [cacheConfig]
  )
  const performanceMonitor = useMemo(
    () => new OptimizedPerformanceMonitor(),
    []
  )

  // 캐시 키 생성
  const generateCacheKey = useCallback(() => {
    if (cacheKey) return cacheKey
    return `api-${JSON.stringify(dependencies)}`
  }, [cacheKey, dependencies])

  // API 호출 함수
  const executeApiCall = useCallback(
    async (isRefresh = false) => {
      const key = generateCacheKey()

      // 캐시 확인 (새로고침이 아닌 경우)
      if (!isRefresh) {
        const cachedData = cacheManager.get(key)
        if (cachedData) {
          setState(prev => ({
            ...prev,
            data: cachedData,
            lastUpdated: Date.now(),
            cacheKey: key,
          }))
          onSuccess?.(cachedData)
          return cachedData
        }
      }

      // 로딩 상태 설정
      setState(prev => ({
        ...prev,
        isLoading: true,
        isRefreshing: isRefresh,
        isInitialLoading: !prev.data && !isRefresh,
        error: null,
      }))

      try {
        performanceMonitor.startTimer('apiCall')

        const result = await withRetry(apiFunction, retryConfig)

        const apiCallTime = performanceMonitor.endTimer('apiCall')

        if (result.success && result.data !== undefined) {
          // 캐시에 저장
          cacheManager.set(key, result.data)

          setState(prev => ({
            ...prev,
            data: result.data!,
            lastUpdated: Date.now(),
            cacheKey: key,
            retryCount: 0,
          }))

          onSuccess?.(result.data)

          // 성능 로깅 (개발 환경)
          if (import.meta.env.DEV) {
            console.log(`🚀 API 호출 완료: ${apiCallTime.toFixed(2)}ms`)
          }

          return result.data
        } else {
          throw new Error(result.message || 'API 호출 실패')
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '알 수 없는 오류'

        setState(prev => ({
          ...prev,
          error: errorMessage,
          retryCount: (prev.retryCount || 0) + 1,
          lastErrorTime: Date.now(),
        }))

        onError?.(errorMessage)
        throw error
      } finally {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          isInitialLoading: false,
        }))
      }
    },
    [
      apiFunction,
      generateCacheKey,
      cacheManager,
      performanceMonitor,
      retryConfig,
      onSuccess,
      onError,
    ]
  )

  // 데이터 새로고침
  const refresh = useCallback(async () => {
    return executeApiCall(true)
  }, [executeApiCall])

  // 에러 초기화
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      retryCount: 0,
      lastErrorTime: undefined,
    }))
  }, [])

  // 캐시 초기화
  const clearCache = useCallback(() => {
    cacheManager.clear()
    setState(prev => ({
      ...prev,
      data: null,
      lastUpdated: null,
      cacheKey: null,
    }))
  }, [cacheManager])

  // 성능 메트릭 조회
  const getPerformanceMetrics = useCallback(() => {
    const cacheStats = cacheManager.getStats()
    const performanceMetrics = performanceMonitor.getMetrics()

    return {
      ...performanceMetrics,
      cacheHitRate: cacheStats.hitRate,
      cacheSize: cacheStats.size,
    }
  }, [cacheManager, performanceMonitor])

  // 초기 로드
  useEffect(() => {
    if (immediate) {
      executeApiCall()
    }
  }, [immediate, executeApiCall])

  // 의존성 변경 시 재호출
  useEffect(() => {
    if (immediate && dependencies.length > 0) {
      executeApiCall()
    }
  }, dependencies)

  return {
    // 상태
    ...state,

    // 액션
    refetch: executeApiCall,
    refresh,
    clearError,
    clearCache,

    // 유틸리티
    getPerformanceMetrics,
    isStale: state.lastUpdated
      ? Date.now() - state.lastUpdated > cacheConfig.duration
      : false,
  }
}

// POST 요청용 훅
export function useOptimizedMutation<T = any, D = any>(
  apiFunction: (data: D) => Promise<OptimizedApiResponse<T>>,
  options: {
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
    invalidateCache?: boolean
  } = {}
) {
  const { onSuccess, onError, invalidateCache = true } = options

  const [state, setState] = useState<
    OptimizedLoadingState & OptimizedErrorState
  >({
    isLoading: false,
    isRefreshing: false,
    isInitialLoading: false,
    error: null,
    retryCount: 0,
    lastErrorTime: undefined,
  })

  const execute = useCallback(
    async (data: D) => {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }))

      try {
        const result = await withRetry(() => apiFunction(data))

        if (result.success && result.data !== undefined) {
          setState(prev => ({
            ...prev,
            retryCount: 0,
          }))

          onSuccess?.(result.data)
          return result.data
        } else {
          throw new Error(result.message || '요청 실패')
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '알 수 없는 오류'

        setState(prev => ({
          ...prev,
          error: errorMessage,
          retryCount: (prev.retryCount || 0) + 1,
          lastErrorTime: Date.now(),
        }))

        onError?.(errorMessage)
        throw error
      } finally {
        setState(prev => ({
          ...prev,
          isLoading: false,
        }))
      }
    },
    [apiFunction, onSuccess, onError]
  )

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      retryCount: 0,
      lastErrorTime: undefined,
    }))
  }, [])

  return {
    ...state,
    execute,
    clearError,
  }
}
