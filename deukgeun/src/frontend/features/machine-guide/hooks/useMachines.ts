// ============================================================================
// Machine Guide Hook
// ============================================================================

import { useState, useCallback, useRef, useMemo } from "react"
import { MachineApiService } from "@frontend/features/machine-guide/services/machineApi"
import type { Machine, MachineDTO } from "@dto/index"
import type { MachineFilterQuery } from "@frontend/features/machine-guide/types"

const FETCH_COOLDOWN = 500 // 0.5초로 단축
const CACHE_DURATION = 5 * 60 * 1000 // 5분 캐시
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000

export const useMachines = () => {
  const [machines, setMachines] = useState<MachineDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState<string>("")
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [retryCount, setRetryCount] = useState(0)

  // 캐시 시스템
  const machinesCache = useRef<
    Map<string, { data: MachineDTO[]; timestamp: number }>
  >(new Map())

  // API 서비스 인스턴스
  const apiService = useMemo(() => MachineApiService.getInstance(), [])

  // 캐시 유틸리티 함수들
  const getCachedData = useCallback((key: string) => {
    const cached = machinesCache.current.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    return null
  }, [])

  const setCachedData = useCallback((key: string, data: MachineDTO[]) => {
    machinesCache.current.set(key, {
      data,
      timestamp: Date.now(),
    })
  }, [])

  // 로딩 및 에러 상태 관리 헬퍼
  const withLoading = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
      const startTime = performance.now()
      setLoading(true)
      setError(null)

      try {
        const result = await operation()
        const endTime = performance.now()

        // 성능 메트릭 로깅 (개발 환경에서만)
        if (import.meta.env.DEV) {
          console.log(`🚀 API 호출 완료: ${(endTime - startTime).toFixed(2)}ms`)
        }

        setRetryCount(0)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // 재시도 로직
  const withRetry = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
      let lastError: Error

      for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
        try {
          return await operation()
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err))

          // 404 에러는 재시도하지 않음
          if (err instanceof Error && err.message.includes('404')) {
            console.warn('⚠️ 404 에러: 재시도하지 않음')
            throw lastError
          }

          if (attempt < MAX_RETRY_ATTEMPTS) {
            console.warn(
              `⚠️ API 호출 실패 (${attempt}/${MAX_RETRY_ATTEMPTS}), ${RETRY_DELAY}ms 후 재시도...`
            )
            setRetryCount(attempt)
            await new Promise(resolve =>
              setTimeout(resolve, RETRY_DELAY * attempt)
            )
          }
        }
      }

      throw lastError!
    },
    []
  )

  // 쿨다운 체크
  const checkCooldown = useCallback(() => {
    const now = Date.now()
    if (now - lastFetchTime < FETCH_COOLDOWN) {
      const remaining = FETCH_COOLDOWN - (now - lastFetchTime)
      console.log(`⏳ API 호출 제한: ${remaining}ms 후 재시도 가능`)
      return false
    }
    return true
  }, [lastFetchTime])

  // 모든 머신 조회
  const fetchMachines = useCallback(async () => {
    if (!checkCooldown()) return

    const cacheKey = "all-machines"
    const cachedData = getCachedData(cacheKey)

    if (cachedData) {
      setMachines(cachedData)
      setCurrentFilter("")
      return
    }

    await withLoading(async () => {
      const result = await withRetry(() => apiService.getMachines())
      setMachines(result.machines as MachineDTO[])
      setCachedData(cacheKey, result.machines as MachineDTO[])
      setCurrentFilter("")
      setLastFetchTime(Date.now())
    })
  }, [
    apiService,
    checkCooldown,
    getCachedData,
    setCachedData,
    withLoading,
    withRetry,
  ])

  // 카테고리별 머신 조회
  const getMachinesByCategory = useCallback(
    async (category: string) => {
      if (!checkCooldown()) return

      const cacheKey = `category-${category}`
      const cachedData = getCachedData(cacheKey)

      if (cachedData) {
        setMachines(cachedData)
        setCurrentFilter(`카테고리: ${category}`)
        return
      }

      await withLoading(async () => {
        const result = await withRetry(() =>
          apiService.getMachinesByCategory(category)
        )
        setMachines(result.machines as MachineDTO[])
        setCachedData(cacheKey, result.machines as MachineDTO[])
        setCurrentFilter(`카테고리: ${category}`)
        setLastFetchTime(Date.now())
      })
    },
    [
      apiService,
      checkCooldown,
      getCachedData,
      setCachedData,
      withLoading,
      withRetry,
    ]
  )

  // 난이도별 머신 조회
  const getMachinesByDifficulty = useCallback(
    async (difficulty: string) => {
      if (!checkCooldown()) return

      const cacheKey = `difficulty-${difficulty}`
      const cachedData = getCachedData(cacheKey)

      if (cachedData) {
        setMachines(cachedData)
        setCurrentFilter(`난이도: ${difficulty}`)
        return
      }

      await withLoading(async () => {
        const result = await withRetry(() =>
          apiService.getMachinesByDifficulty(difficulty)
        )
        setMachines(result.machines as MachineDTO[])
        setCachedData(cacheKey, result.machines as MachineDTO[])
        setCurrentFilter(`난이도: ${difficulty}`)
        setLastFetchTime(Date.now())
      })
    },
    [
      apiService,
      checkCooldown,
      getCachedData,
      setCachedData,
      withLoading,
      withRetry,
    ]
  )

  // 타겟별 머신 조회
  const getMachinesByTarget = useCallback(
    async (target: string) => {
      if (!checkCooldown()) return

      const cacheKey = `target-${target}`
      const cachedData = getCachedData(cacheKey)

      if (cachedData) {
        setMachines(cachedData)
        setCurrentFilter(`타겟: ${target}`)
        return
      }

      await withLoading(async () => {
        const result = await withRetry(() =>
          apiService.getMachinesByTarget(target)
        )
        setMachines(result.machines as MachineDTO[])
        setCachedData(cacheKey, result.machines as MachineDTO[])
        setCurrentFilter(`타겟: ${target}`)
        setLastFetchTime(Date.now())
      })
    },
    [
      apiService,
      checkCooldown,
      getCachedData,
      setCachedData,
      withLoading,
      withRetry,
    ]
  )

  // 머신 필터링
  const filterMachines = useCallback(
    async (filters: MachineFilterQuery) => {
      if (!checkCooldown()) return

      const cacheKey = `filter-${JSON.stringify(filters)}`
      const cachedData = getCachedData(cacheKey)

      if (cachedData) {
        setMachines(cachedData)
        setCurrentFilter("필터 적용됨")
        return
      }

      await withLoading(async () => {
        const result = await withRetry(() => apiService.filterMachines(filters))
        setMachines(result.machines as MachineDTO[])
        setCachedData(cacheKey, result.machines as MachineDTO[])
        setCurrentFilter("필터 적용됨")
        setLastFetchTime(Date.now())
      })
    },
    [
      apiService,
      checkCooldown,
      getCachedData,
      setCachedData,
      withLoading,
      withRetry,
    ]
  )

  // 머신 생성
  const createMachine = useCallback(
    async (machineData: any) => {
      await withLoading(async () => {
        const result = await withRetry(() =>
          apiService.createMachine(machineData)
        )
        // 캐시 무효화
        machinesCache.current.clear()
        // 새로 생성된 머신을 목록에 추가
        setMachines(prev => [...prev, result.machine as MachineDTO])
        setLastFetchTime(Date.now())
        return result
      })
    },
    [apiService, withLoading, withRetry]
  )

  // 머신 수정
  const updateMachine = useCallback(
    async (id: number, machineData: any) => {
      await withLoading(async () => {
        const result = await withRetry(() =>
          apiService.updateMachine(id, machineData)
        )
        // 캐시 무효화
        machinesCache.current.clear()
        // 수정된 머신을 목록에서 업데이트
        setMachines(prev =>
          prev.map(machine => (machine.id === id ? result.machine as MachineDTO : machine))
        )
        setLastFetchTime(Date.now())
        return result
      })
    },
    [apiService, withLoading, withRetry]
  )

  // 머신 삭제
  const deleteMachine = useCallback(
    async (id: number) => {
      await withLoading(async () => {
        await withRetry(() => apiService.deleteMachine(id))
        // 캐시 무효화
        machinesCache.current.clear()
        // 삭제된 머신을 목록에서 제거
        setMachines(prev => prev.filter(machine => machine.id !== id))
        setLastFetchTime(Date.now())
      })
    },
    [apiService, withLoading, withRetry]
  )

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 캐시 초기화
  const clearCache = useCallback(() => {
    machinesCache.current.clear()
    console.log("🗑️ 캐시가 초기화되었습니다")
  }, [])

  // 메모이제이션된 값들
  const memoizedMachines = useMemo(() => machines, [machines])
  const memoizedLoading = useMemo(() => loading, [loading])
  const memoizedError = useMemo(() => error, [error])
  const memoizedCurrentFilter = useMemo(() => currentFilter, [currentFilter])

  return {
    // 상태
    machines: memoizedMachines,
    loading: memoizedLoading,
    error: memoizedError,
    currentFilter: memoizedCurrentFilter,
    retryCount,

    // 액션
    fetchMachines,
    getMachinesByCategory,
    getMachinesByDifficulty,
    getMachinesByTarget,
    filterMachines,
    createMachine,
    updateMachine,
    deleteMachine,
    clearError,
    clearCache,
  }
}
