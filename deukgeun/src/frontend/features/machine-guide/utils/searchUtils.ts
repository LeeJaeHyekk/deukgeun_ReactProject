// ============================================================================
// Machine Guide Search Utilities
// ============================================================================

import type { MachineDTO } from "../../../../shared/types/dto/machine.dto"
import { safeStringExtract, safeArrayExtract } from "./validation"

/**
 * 머신 검색 필터링 함수
 */
export function filterMachinesBySearch(
  machines: MachineDTO[],
  searchTerm: string
): MachineDTO[] {
  if (!searchTerm.trim()) {
    return machines
  }

  const searchLower = searchTerm.toLowerCase()
  
  return machines.filter((machine) => {
    const categoryStr = safeStringExtract(machine.category)
    const difficultyStr = safeStringExtract(machine.difficulty)
    const targetMuscles = safeArrayExtract(machine.targetMuscles)
    
    return (
      machine.name.toLowerCase().includes(searchLower) ||
      machine.nameKo?.toLowerCase().includes(searchLower) ||
      machine.nameEn?.toLowerCase().includes(searchLower) ||
      machine.shortDesc?.toLowerCase().includes(searchLower) ||
      categoryStr.toLowerCase().includes(searchLower) ||
      difficultyStr.toLowerCase().includes(searchLower) ||
      targetMuscles.some((muscle) =>
        muscle.toLowerCase().includes(searchLower)
      )
    )
  })
}

/**
 * 검색어 디바운싱을 위한 유틸리티
 */
export function createDebouncedSearch(
  callback: (searchTerm: string) => void,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (searchTerm: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      callback(searchTerm)
    }, delay)
  }
}

/**
 * 검색 결과 통계
 */
export function getSearchStats(machines: MachineDTO[], searchTerm: string) {
  const total = machines.length
  const filtered = filterMachinesBySearch(machines, searchTerm)
  
  return {
    total,
    filtered: filtered.length,
    hasResults: filtered.length > 0,
    searchTerm: searchTerm.trim(),
  }
}
