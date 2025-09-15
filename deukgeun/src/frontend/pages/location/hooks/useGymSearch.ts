import { useState, useEffect, useCallback } from 'react'
import { fetchGymsByKeyword } from '../API/kakao'
import type { Gym } from '../types'

interface UseGymSearchOptions {
  initialQuery?: string
  debounceMs?: number
  maxResults?: number
}

interface UseGymSearchReturn {
  gyms: Gym[]
  loading: boolean
  error: string | null
  searchGyms: (query: string) => Promise<void>
  clearResults: () => void
  hasSearched: boolean
}

export function useGymSearch(
  options: UseGymSearchOptions = {}
): UseGymSearchReturn {
  const { initialQuery = '', debounceMs = 300, maxResults = 20 } = options

  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  )

  const searchGyms = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setGyms([])
        setHasSearched(false)
        return
      }

      setLoading(true)
      setError(null)
      setHasSearched(true)

      try {
        // 현재 위치 가져오기 (기본값: 서울시청)
        const defaultPosition = { lat: 37.5665, lng: 126.978 }

        const results = await fetchGymsByKeyword(query, defaultPosition)
        const limitedResults = results.slice(0, maxResults)

        setGyms(limitedResults)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : '헬스장 검색 중 오류가 발생했습니다.'
        setError(errorMessage)
        setGyms([])
      } finally {
        setLoading(false)
      }
    },
    [maxResults]
  )

  const debouncedSearchGyms = useCallback(
    async (query: string) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      const timer = setTimeout(async () => {
        await searchGyms(query)
      }, debounceMs)

      setDebounceTimer(timer)
    },
    [searchGyms, debounceMs, debounceTimer]
  )

  const clearResults = useCallback(() => {
    setGyms([])
    setError(null)
    setHasSearched(false)
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      setDebounceTimer(null)
    }
  }, [debounceTimer])

  // 초기 쿼리가 있으면 검색 실행
  useEffect(() => {
    if (initialQuery) {
      debouncedSearchGyms(initialQuery)
    }
  }, [initialQuery, debouncedSearchGyms])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  return {
    gyms,
    loading,
    error,
    searchGyms: debouncedSearchGyms,
    clearResults,
    hasSearched,
  }
}
