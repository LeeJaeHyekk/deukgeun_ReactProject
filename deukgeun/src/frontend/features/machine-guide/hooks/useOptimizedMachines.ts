// ============================================================================
// 최적화된 머신 가이드 훅
// 기존 useMachines 훅을 최적화하여 성능과 사용자 경험을 향상
// ============================================================================

import { useState, useCallback, useRef, useMemo } from 'react'
import { MachineApiService } from '../services/machineApi'
import { useOptimizedApi } from '@shared/hooks/useOptimizedApi'
import {
  useDebounce,
  useThrottle,
  usePerformanceMonitor,
} from '@shared/utils/performanceOptimizer'
import type { EnhancedMachine } from '@shared/types/machineGuide.types'
import type { MachineFilterQuery } from '../types'
import type { Machine } from '@shared/types/dto/machine.dto'

// 최적화된 설정
const OPTIMIZED_CONFIG = {
  CACHE_DURATION: 10 * 60 * 1000, // 10분 캐시
  DEBOUNCE_DELAY: 300, // 검색 디바운스
  THROTTLE_DELAY: 1000, // API 호출 스로틀
  MAX_CACHE_SIZE: 50,
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 500,
}

export const useOptimizedMachines = () => {
  // 성능 모니터링
  usePerformanceMonitor('useOptimizedMachines')

  // 상태 관리
  const [machines, setMachines] = useState<EnhancedMachine[]>([])
  const [currentFilter, setCurrentFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [selectedTarget, setSelectedTarget] = useState<string>('')

  // API 서비스 인스턴스
  const apiService = useMemo(() => MachineApiService.getInstance(), [])

  // Machine을 EnhancedMachine으로 변환하는 최적화된 함수
  const convertToEnhancedMachine = useCallback(
    (machine: Machine): EnhancedMachine => {
      return {
        id: machine.id,
        machineKey: machine.machineKey,
        name: machine.name,
        nameEn: machine.nameEn || machine.name,
        imageUrl: machine.imageUrl,
        shortDesc: machine.shortDesc,
        category: machine.category as any,
        difficulty: machine.difficulty as any,
        isActive: machine.isActive,
        anatomy: machine.anatomy || {
          primaryMuscles: machine.targetMuscles || [],
          secondaryMuscles: [],
          antagonistMuscles: [],
          easyExplanation: machine.shortDesc,
        },
        guide: machine.guide || {
          setup: machine.detailDesc || '',
          execution: machine.detailDesc ? [machine.detailDesc] : [],
          movementDirection: '',
          idealStimulus: machine.positiveEffect || '',
          commonMistakes: [],
          breathing: '',
          safetyTips: [],
        },
        training: machine.training || {
          recommendedReps: '',
          recommendedSets: '',
          restTime: '',
          variations: [],
          levelUpOptions: [],
          beginnerTips: [],
        },
        extraInfo: machine.extraInfo || {
          dailyUseCase: machine.shortDesc,
          searchKeywords: [
            machine.name,
            machine.nameEn || '',
            machine.category,
          ].filter(Boolean),
        },
      }
    },
    []
  )

  // 모든 머신 조회 API 훅
  const {
    data: allMachinesData,
    isLoading: isLoadingAll,
    error: allMachinesError,
    refetch: refetchAllMachines,
    getPerformanceMetrics,
  } = useOptimizedApi(
    async () => {
      const result = await apiService.getMachines()
      return {
        success: true,
        message: 'Machines retrieved successfully',
        data: result,
      }
    },
    {
      cacheKey: 'all-machines',
      cacheConfig: {
        duration: OPTIMIZED_CONFIG.CACHE_DURATION,
        maxSize: OPTIMIZED_CONFIG.MAX_CACHE_SIZE,
      },
      retryConfig: {
        maxAttempts: OPTIMIZED_CONFIG.RETRY_ATTEMPTS,
        baseDelay: OPTIMIZED_CONFIG.RETRY_DELAY,
        maxDelay: 10000,
      },
      onSuccess: data => {
        const enhancedMachines = data.machines.map(convertToEnhancedMachine)
        setMachines(enhancedMachines)
        setCurrentFilter('')
      },
    }
  )

  // 카테고리별 머신 조회 API 훅
  const {
    data: categoryMachinesData,
    isLoading: isLoadingCategory,
    error: categoryError,
    refetch: refetchCategoryMachines,
  } = useOptimizedApi(
    async () => {
      const result = await apiService.getMachinesByCategory(selectedCategory)
      return {
        success: true,
        message: 'Category machines retrieved successfully',
        data: result,
      }
    },
    {
      cacheKey: `category-${selectedCategory}`,
      cacheConfig: {
        duration: OPTIMIZED_CONFIG.CACHE_DURATION,
        maxSize: OPTIMIZED_CONFIG.MAX_CACHE_SIZE,
      },
      retryConfig: {
        maxAttempts: OPTIMIZED_CONFIG.RETRY_ATTEMPTS,
        baseDelay: OPTIMIZED_CONFIG.RETRY_DELAY,
        maxDelay: 10000,
      },
      immediate: false, // 수동 호출
      onSuccess: data => {
        const enhancedMachines = data.machines.map(convertToEnhancedMachine)
        setMachines(enhancedMachines)
        setCurrentFilter(`카테고리: ${selectedCategory}`)
      },
    }
  )

  // 난이도별 머신 조회 API 훅
  const {
    data: difficultyMachinesData,
    isLoading: isLoadingDifficulty,
    error: difficultyError,
    refetch: refetchDifficultyMachines,
  } = useOptimizedApi(
    async () => {
      const result =
        await apiService.getMachinesByDifficulty(selectedDifficulty)
      return {
        success: true,
        message: 'Difficulty machines retrieved successfully',
        data: result,
      }
    },
    {
      cacheKey: `difficulty-${selectedDifficulty}`,
      cacheConfig: {
        duration: OPTIMIZED_CONFIG.CACHE_DURATION,
        maxSize: OPTIMIZED_CONFIG.MAX_CACHE_SIZE,
      },
      retryConfig: {
        maxAttempts: OPTIMIZED_CONFIG.RETRY_ATTEMPTS,
        baseDelay: OPTIMIZED_CONFIG.RETRY_DELAY,
        maxDelay: 10000,
      },
      immediate: false,
      onSuccess: data => {
        const enhancedMachines = data.machines.map(convertToEnhancedMachine)
        setMachines(enhancedMachines)
        setCurrentFilter(`난이도: ${selectedDifficulty}`)
      },
    }
  )

  // 타겟별 머신 조회 API 훅
  const {
    data: targetMachinesData,
    isLoading: isLoadingTarget,
    error: targetError,
    refetch: refetchTargetMachines,
  } = useOptimizedApi(
    async () => {
      const result = await apiService.getMachinesByTarget(selectedTarget)
      return {
        success: true,
        message: 'Target machines retrieved successfully',
        data: result,
      }
    },
    {
      cacheKey: `target-${selectedTarget}`,
      cacheConfig: {
        duration: OPTIMIZED_CONFIG.CACHE_DURATION,
        maxSize: OPTIMIZED_CONFIG.MAX_CACHE_SIZE,
      },
      retryConfig: {
        maxAttempts: OPTIMIZED_CONFIG.RETRY_ATTEMPTS,
        baseDelay: OPTIMIZED_CONFIG.RETRY_DELAY,
        maxDelay: 10000,
      },
      immediate: false,
      onSuccess: data => {
        const enhancedMachines = data.machines.map(convertToEnhancedMachine)
        setMachines(enhancedMachines)
        setCurrentFilter(`타겟: ${selectedTarget}`)
      },
    }
  )

  // 필터링 API 훅
  const {
    data: filteredMachinesData,
    isLoading: isLoadingFiltered,
    error: filteredError,
    refetch: refetchFilteredMachines,
  } = useOptimizedApi(
    async () => {
      const filters: MachineFilterQuery = {
        category: (selectedCategory as any) || undefined,
        difficulty: (selectedDifficulty as any) || undefined,
        target: selectedTarget || undefined,
        search: searchQuery || undefined,
      }
      const result = await apiService.filterMachines(filters)
      return {
        success: true,
        message: 'Filtered machines retrieved successfully',
        data: result,
      }
    },
    {
      cacheKey: `filter-${JSON.stringify({ selectedCategory, selectedDifficulty, selectedTarget, searchQuery })}`,
      cacheConfig: {
        duration: OPTIMIZED_CONFIG.CACHE_DURATION,
        maxSize: OPTIMIZED_CONFIG.MAX_CACHE_SIZE,
      },
      retryConfig: {
        maxAttempts: OPTIMIZED_CONFIG.RETRY_ATTEMPTS,
        baseDelay: OPTIMIZED_CONFIG.RETRY_DELAY,
        maxDelay: 10000,
      },
      immediate: false,
      onSuccess: data => {
        const enhancedMachines = data.machines.map(convertToEnhancedMachine)
        setMachines(enhancedMachines)
        setCurrentFilter('필터 적용됨')
      },
    }
  )

  // 디바운스된 검색 함수
  const debouncedSearch = useDebounce((query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      refetchFilteredMachines()
    } else {
      refetchAllMachines()
    }
  }, OPTIMIZED_CONFIG.DEBOUNCE_DELAY)

  // 스로틀된 API 호출 함수
  const throttledApiCall = useThrottle((apiCall: () => void) => {
    apiCall()
  }, OPTIMIZED_CONFIG.THROTTLE_DELAY)

  // 최적화된 액션 함수들
  const fetchMachines = useCallback(() => {
    throttledApiCall(() => refetchAllMachines())
  }, [throttledApiCall, refetchAllMachines])

  const getMachinesByCategory = useCallback(
    (category: string) => {
      setSelectedCategory(category)
      setSelectedDifficulty('')
      setSelectedTarget('')
      setSearchQuery('')
      throttledApiCall(() => refetchCategoryMachines())
    },
    [throttledApiCall, refetchCategoryMachines]
  )

  const getMachinesByDifficulty = useCallback(
    (difficulty: string) => {
      setSelectedDifficulty(difficulty)
      setSelectedCategory('')
      setSelectedTarget('')
      setSearchQuery('')
      throttledApiCall(() => refetchDifficultyMachines())
    },
    [throttledApiCall, refetchDifficultyMachines]
  )

  const getMachinesByTarget = useCallback(
    (target: string) => {
      setSelectedTarget(target)
      setSelectedCategory('')
      setSelectedDifficulty('')
      setSearchQuery('')
      throttledApiCall(() => refetchTargetMachines())
    },
    [throttledApiCall, refetchTargetMachines]
  )

  const filterMachines = useCallback(
    (filters: any) => {
      setSelectedCategory(filters.category || '')
      setSelectedDifficulty(filters.difficulty || '')
      setSelectedTarget(filters.target || '')
      setSearchQuery(filters.search || '')
      throttledApiCall(() => refetchFilteredMachines())
    },
    [throttledApiCall, refetchFilteredMachines]
  )

  const searchMachines = useCallback(
    (query: string) => {
      debouncedSearch(query)
    },
    [debouncedSearch]
  )

  // 로컬 필터링 (캐시된 데이터에서 빠른 검색)
  const localFilter = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setMachines(machines)
        setCurrentFilter('')
        return
      }

      const filtered = machines.filter(
        machine =>
          machine.name.toLowerCase().includes(query.toLowerCase()) ||
          machine.nameEn?.toLowerCase().includes(query.toLowerCase()) ||
          machine.shortDesc?.toLowerCase().includes(query.toLowerCase()) ||
          machine.extraInfo?.searchKeywords?.some((keyword: string) =>
            keyword.toLowerCase().includes(query.toLowerCase())
          )
      )

      setMachines(filtered)
      setCurrentFilter(`검색: ${query}`)
    },
    [machines]
  )

  // 메모이제이션된 값들
  const memoizedMachines = useMemo(() => machines, [machines])
  const memoizedCurrentFilter = useMemo(() => currentFilter, [currentFilter])

  // 통합 로딩 상태
  const isLoading = useMemo(
    () =>
      isLoadingAll ||
      isLoadingCategory ||
      isLoadingDifficulty ||
      isLoadingTarget ||
      isLoadingFiltered,
    [
      isLoadingAll,
      isLoadingCategory,
      isLoadingDifficulty,
      isLoadingTarget,
      isLoadingFiltered,
    ]
  )

  // 통합 에러 상태
  const error = useMemo(
    () =>
      allMachinesError ||
      categoryError ||
      difficultyError ||
      targetError ||
      filteredError,
    [
      allMachinesError,
      categoryError,
      difficultyError,
      targetError,
      filteredError,
    ]
  )

  // 성능 메트릭
  const performanceMetrics = useMemo(
    () => getPerformanceMetrics(),
    [getPerformanceMetrics]
  )

  return {
    // 상태
    machines: memoizedMachines,
    loading: isLoading,
    error,
    currentFilter: memoizedCurrentFilter,
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    selectedTarget,

    // 액션
    fetchMachines,
    getMachinesByCategory,
    getMachinesByDifficulty,
    getMachinesByTarget,
    filterMachines,
    searchMachines,
    localFilter,

    // 유틸리티
    performanceMetrics,
    convertToEnhancedMachine,
  }
}
