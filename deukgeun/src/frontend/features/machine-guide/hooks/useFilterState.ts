// ============================================================================
// Filter State Hook
// ============================================================================

import { useState, useCallback, useMemo, useEffect } from "react"
import { createDebouncedSearch } from "../utils/searchUtils"
import { filterMachinesBySearch } from "../utils/searchUtils"
import { isValidSearchTerm, isValidFilterValue } from "../utils/validation"
import type { MachineDTO } from "../../../../shared/types/dto/machine.dto"

export interface FilterState {
  selectedCategory: string
  selectedDifficulty: string
  selectedTarget: string
  searchTerm: string
}

export interface FilterActions {
  setCategory: (category: string) => void
  setDifficulty: (difficulty: string) => void
  setTarget: (target: string) => void
  setSearchTerm: (search: string) => void
  resetFilters: () => void
  clearOtherFilters: (type: 'category' | 'difficulty' | 'target') => void
}

export interface UseFilterStateReturn extends FilterState, FilterActions {
  filteredMachines: MachineDTO[]
  hasActiveFilters: boolean
  activeFilterCount: number
  searchStats: {
    total: number
    filtered: number
    hasResults: boolean
  }
}

export function useFilterState(
  machines: MachineDTO[],
  onFilterChange?: (filters: FilterState) => void
): UseFilterStateReturn {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("")
  const [selectedTarget, setSelectedTarget] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // 필터 상태 객체
  const filterState: FilterState = useMemo(() => ({
    selectedCategory,
    selectedDifficulty,
    selectedTarget,
    searchTerm,
  }), [selectedCategory, selectedDifficulty, selectedTarget, searchTerm])

  // 활성 필터 개수
  const activeFilterCount = useMemo(() => {
    return [
      selectedCategory,
      selectedDifficulty,
      selectedTarget,
      searchTerm,
    ].filter(Boolean).length
  }, [selectedCategory, selectedDifficulty, selectedTarget, searchTerm])

  // 활성 필터 여부
  const hasActiveFilters = activeFilterCount > 0

  // 검색 필터링된 머신들
  const filteredMachines = useMemo(() => {
    if (!isValidSearchTerm(searchTerm)) {
      return machines
    }
    return filterMachinesBySearch(machines, searchTerm)
  }, [machines, searchTerm])

  // 검색 통계
  const searchStats = useMemo(() => ({
    total: machines.length,
    filtered: filteredMachines.length,
    hasResults: filteredMachines.length > 0,
  }), [machines.length, filteredMachines.length])

  // 디바운스된 검색
  const debouncedSearch = useMemo(
    () => createDebouncedSearch((search: string) => {
      setSearchTerm(search)
    }),
    []
  )

  // 카테고리 설정
  const setCategory = useCallback((category: string) => {
    if (!isValidFilterValue(category)) {
      setSelectedCategory("")
      return
    }
    setSelectedCategory(category)
    clearOtherFilters('category')
  }, [])

  // 난이도 설정
  const setDifficulty = useCallback((difficulty: string) => {
    if (!isValidFilterValue(difficulty)) {
      setSelectedDifficulty("")
      return
    }
    setSelectedDifficulty(difficulty)
    clearOtherFilters('difficulty')
  }, [])

  // 타겟 설정
  const setTarget = useCallback((target: string) => {
    if (!isValidFilterValue(target)) {
      setSelectedTarget("")
      return
    }
    setSelectedTarget(target)
    clearOtherFilters('target')
  }, [])

  // 검색어 설정 (디바운스 적용)
  const handleSearchTermChange = useCallback((search: string) => {
    if (!isValidSearchTerm(search)) {
      setSearchTerm("")
      return
    }
    debouncedSearch(search)
  }, [debouncedSearch])

  // 다른 필터들 초기화
  const clearOtherFilters = useCallback((type: 'category' | 'difficulty' | 'target') => {
    if (type !== 'category') setSelectedCategory("")
    if (type !== 'difficulty') setSelectedDifficulty("")
    if (type !== 'target') setSelectedTarget("")
    setSearchTerm("")
  }, [])

  // 모든 필터 초기화
  const resetFilters = useCallback(() => {
    setSelectedCategory("")
    setSelectedDifficulty("")
    setSelectedTarget("")
    setSearchTerm("")
  }, [])

  // 필터 변경 시 콜백 호출
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filterState)
    }
  }, [filterState, onFilterChange])

  return {
    // 상태
    selectedCategory,
    selectedDifficulty,
    selectedTarget,
    searchTerm,
    filteredMachines,
    hasActiveFilters,
    activeFilterCount,
    searchStats,
    
    // 액션
    setCategory,
    setDifficulty,
    setTarget,
    setSearchTerm: handleSearchTermChange,
    resetFilters,
    clearOtherFilters,
  }
}
