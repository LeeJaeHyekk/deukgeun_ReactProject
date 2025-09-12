import { useState, useEffect, useCallback, useMemo } from 'react'
import { Gym } from '../types'
import {
  optimizedSearchGyms,
  getOptimizedNearbyGyms,
  getGymNameSuggestions,
  getGymStats,
  cachedGymSearchService,
  OptimizedSearchParams,
} from '../API/optimizedGymApi'

export interface UseOptimizedGymSearchOptions {
  initialPosition?: { lat: number; lng: number }
  defaultRadius?: number
  enableCache?: boolean
  debounceMs?: number
}

export interface UseOptimizedGymSearchReturn {
  // 상태
  gyms: Gym[]
  isLoading: boolean
  error: string | null
  totalCount: number
  hasMore: boolean

  // 검색 함수들
  searchGyms: (params: OptimizedSearchParams) => Promise<void>
  searchNearbyGyms: (lat: number, lng: number, radius?: number) => Promise<void>
  getSuggestions: (query: string) => Promise<string[]>
  getStats: () => Promise<any>

  // 유틸리티
  clearResults: () => void
  clearCache: () => void
  getCacheSize: () => number
}

export function useOptimizedGymSearch(
  options: UseOptimizedGymSearchOptions = {}
): UseOptimizedGymSearchReturn {
  const {
    initialPosition,
    defaultRadius = 5,
    enableCache = true,
    debounceMs = 300,
  } = options

  // 상태 관리
  const [gyms, setGyms] = useState<Gym[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  )

  // 검색 함수 (디바운스 적용)
  const searchGyms = useCallback(
    async (params: OptimizedSearchParams) => {
      // 이전 타이머 클리어
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      // 디바운스 적용
      const timer = setTimeout(async () => {
        setIsLoading(true)
        setError(null)

        try {
          const searchService = enableCache
            ? cachedGymSearchService
            : { searchGyms: optimizedSearchGyms }
          const result = await searchService.searchGyms(params)

          if (result.success) {
            setGyms(result.data)
            setTotalCount(result.pagination?.total || result.data.length)
            setHasMore(result.pagination?.hasMore || false)
          } else {
            setError(result.message || '검색에 실패했습니다.')
          }
        } catch (err) {
          console.error('헬스장 검색 오류:', err)
          setError('검색 중 오류가 발생했습니다.')
        } finally {
          setIsLoading(false)
        }
      }, debounceMs)

      setDebounceTimer(timer)
    },
    [debounceTimer, debounceMs, enableCache]
  )

  // 주변 헬스장 검색
  const searchNearbyGyms = useCallback(
    async (lat: number, lng: number, radius: number = defaultRadius) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await getOptimizedNearbyGyms(lat, lng, radius)

        if (result.success) {
          setGyms(result.data)
          setTotalCount(result.pagination?.total || result.data.length)
          setHasMore(result.pagination?.hasMore || false)
        } else {
          setError(result.message || '주변 헬스장 검색에 실패했습니다.')
        }
      } catch (err) {
        console.error('주변 헬스장 검색 오류:', err)
        setError('주변 헬스장 검색 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    },
    [defaultRadius]
  )

  // 자동완성 검색
  const getSuggestions = useCallback(
    async (query: string): Promise<string[]> => {
      if (query.length < 2) return []

      try {
        const result = await getGymNameSuggestions(query)
        return result.success ? result.data : []
      } catch (err) {
        console.error('자동완성 검색 오류:', err)
        return []
      }
    },
    []
  )

  // 통계 조회
  const getStats = useCallback(async () => {
    try {
      const result = await getGymStats()
      return result.success ? result.data : null
    } catch (err) {
      console.error('통계 조회 오류:', err)
      return null
    }
  }, [])

  // 결과 클리어
  const clearResults = useCallback(() => {
    setGyms([])
    setTotalCount(0)
    setHasMore(false)
    setError(null)
  }, [])

  // 캐시 클리어
  const clearCache = useCallback(() => {
    if (enableCache) {
      cachedGymSearchService.clearCache()
    }
  }, [enableCache])

  // 캐시 크기 조회
  const getCacheSize = useCallback(() => {
    return enableCache ? cachedGymSearchService.getCacheSize() : 0
  }, [enableCache])

  // 초기 위치가 있으면 주변 헬스장 검색
  useEffect(() => {
    if (initialPosition && gyms.length === 0) {
      searchNearbyGyms(initialPosition.lat, initialPosition.lng)
    }
  }, [initialPosition, searchNearbyGyms, gyms.length])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  // 메모이제이션된 반환값
  return useMemo(
    () => ({
      // 상태
      gyms,
      isLoading,
      error,
      totalCount,
      hasMore,

      // 검색 함수들
      searchGyms,
      searchNearbyGyms,
      getSuggestions,
      getStats,

      // 유틸리티
      clearResults,
      clearCache,
      getCacheSize,
    }),
    [
      gyms,
      isLoading,
      error,
      totalCount,
      hasMore,
      searchGyms,
      searchNearbyGyms,
      getSuggestions,
      getStats,
      clearResults,
      clearCache,
      getCacheSize,
    ]
  )
}

/**
 * 자동완성 전용 훅
 */
export function useGymNameSuggestions(debounceMs: number = 200) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  )

  const searchSuggestions = useCallback(
    async (query: string) => {
      // 이전 타이머 클리어
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      if (query.length < 2) {
        setSuggestions([])
        return
      }

      // 디바운스 적용
      const timer = setTimeout(async () => {
        setIsLoading(true)
        try {
          const result = await getGymNameSuggestions(query)
          setSuggestions(result.success ? result.data : [])
        } catch (err) {
          console.error('자동완성 검색 오류:', err)
          setSuggestions([])
        } finally {
          setIsLoading(false)
        }
      }, debounceMs)

      setDebounceTimer(timer)
    },
    [debounceTimer, debounceMs]
  )

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  return {
    suggestions,
    isLoading,
    searchSuggestions,
    clearSuggestions: () => setSuggestions([]),
  }
}
