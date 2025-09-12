// ============================================================================
// Machine Guide Utilities
// ============================================================================

import type {
  Machine,
  MachineCategory,
  DifficultyLevel,
  MachineFilterQuery,
  MachineStats,
  MachineSearchResult,
  MachineSearchOptions,
} from '../types/machineGuide.types'

/**
 * 머신 데이터를 카테고리별로 그룹화합니다.
 */
export function groupMachinesByCategory(
  machines: Machine[]
): Record<MachineCategory, Machine[]> {
  return machines.reduce(
    (groups, machine) => {
      if (!groups[machine.category]) {
        groups[machine.category] = []
      }
      groups[machine.category].push(machine)
      return groups
    },
    {} as Record<MachineCategory, Machine[]>
  )
}

/**
 * 머신 데이터를 난이도별로 그룹화합니다.
 */
export function groupMachinesByDifficulty(
  machines: Machine[]
): Record<DifficultyLevel, Machine[]> {
  return machines.reduce(
    (groups, machine) => {
      if (!groups[machine.difficulty]) {
        groups[machine.difficulty] = []
      }
      groups[machine.difficulty].push(machine)
      return groups
    },
    {} as Record<DifficultyLevel, Machine[]>
  )
}

/**
 * 머신 데이터를 필터링합니다.
 */
export function filterMachines(
  machines: Machine[],
  filter: MachineFilterQuery
): Machine[] {
  return machines.filter(machine => {
    // 카테고리 필터
    if (filter.category && machine.category !== filter.category) {
      return false
    }

    // 난이도 필터
    if (filter.difficulty && machine.difficulty !== filter.difficulty) {
      return false
    }

    // 타겟 근육 필터
    if (
      filter.targetMuscle &&
      !machine.targetMuscles.includes(filter.targetMuscle)
    ) {
      return false
    }

    // 검색어 필터
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase()
      const matchesName =
        machine.name.toLowerCase().includes(searchLower) ||
        machine.nameKo.toLowerCase().includes(searchLower) ||
        machine.nameEn.toLowerCase().includes(searchLower)
      const matchesDesc =
        machine.shortDesc.toLowerCase().includes(searchLower) ||
        machine.detailDesc.toLowerCase().includes(searchLower)
      const matchesMuscles = machine.targetMuscles.some(muscle =>
        muscle.toLowerCase().includes(searchLower)
      )

      if (!matchesName && !matchesDesc && !matchesMuscles) {
        return false
      }
    }

    return true
  })
}

/**
 * 머신 통계를 계산합니다.
 */
export function calculateMachineStats(machines: Machine[]): MachineStats {
  const categoryCounts = machines.reduce(
    (counts, machine) => {
      counts[machine.category] = (counts[machine.category] || 0) + 1
      return counts
    },
    {} as Record<MachineCategory, number>
  )

  const difficultyCounts = machines.reduce(
    (counts, machine) => {
      counts[machine.difficulty] = (counts[machine.difficulty] || 0) + 1
      return counts
    },
    {} as Record<DifficultyLevel, number>
  )

  const mostPopularCategory = Object.entries(categoryCounts).reduce(
    (max, [category, count]) =>
      count > (categoryCounts[max as MachineCategory] || 0) ? category : max
  ) as MachineCategory

  const mostPopularDifficulty = Object.entries(difficultyCounts).reduce(
    (max, [difficulty, count]) =>
      count > (difficultyCounts[max as DifficultyLevel] || 0) ? difficulty : max
  ) as DifficultyLevel

  return {
    totalMachines: machines.length,
    categoryCounts,
    difficultyCounts,
    mostPopularCategory,
    mostPopularDifficulty,
  }
}

/**
 * 머신을 검색합니다.
 */
export function searchMachines(
  machines: Machine[],
  searchTerm: string,
  options: MachineSearchOptions = {}
): MachineSearchResult[] {
  if (!searchTerm.trim()) {
    return machines.map(machine => ({
      machine,
      relevanceScore: 1,
      matchedFields: [],
    }))
  }

  const searchLower = searchTerm.toLowerCase()
  const results: MachineSearchResult[] = []

  for (const machine of machines) {
    if (!options.includeInactive && !machine.isActive) {
      continue
    }

    const matchedFields: string[] = []
    let relevanceScore = 0

    // 이름 매칭 (가장 높은 점수)
    if (machine.name.toLowerCase().includes(searchLower)) {
      matchedFields.push('name')
      relevanceScore += 10
    }
    if (machine.nameKo.toLowerCase().includes(searchLower)) {
      matchedFields.push('nameKo')
      relevanceScore += 10
    }
    if (machine.nameEn.toLowerCase().includes(searchLower)) {
      matchedFields.push('nameEn')
      relevanceScore += 10
    }

    // 설명 매칭
    if (machine.shortDesc.toLowerCase().includes(searchLower)) {
      matchedFields.push('shortDesc')
      relevanceScore += 5
    }
    if (machine.detailDesc.toLowerCase().includes(searchLower)) {
      matchedFields.push('detailDesc')
      relevanceScore += 3
    }

    // 타겟 근육 매칭
    const muscleMatches = machine.targetMuscles.filter(muscle =>
      muscle.toLowerCase().includes(searchLower)
    )
    if (muscleMatches.length > 0) {
      matchedFields.push('targetMuscles')
      relevanceScore += muscleMatches.length * 2
    }

    // 카테고리 매칭
    if (machine.category.toLowerCase().includes(searchLower)) {
      matchedFields.push('category')
      relevanceScore += 1
    }

    if (
      relevanceScore > 0 &&
      (!options.minRelevanceScore ||
        relevanceScore >= options.minRelevanceScore)
    ) {
      results.push({
        machine,
        relevanceScore,
        matchedFields,
      })
    }
  }

  // 관련도 순으로 정렬
  results.sort((a, b) => b.relevanceScore - a.relevanceScore)

  // 최대 결과 수 제한
  if (options.maxResults) {
    return results.slice(0, options.maxResults)
  }

  return results
}

/**
 * 머신의 이미지 URL을 생성합니다.
 */
export function getMachineImageUrl(
  machine: Machine,
  format: 'webp' | 'png' = 'png'
): string {
  if (machine.imageUrl) {
    return machine.imageUrl
  }

  // 기본 이미지 반환
  return '/img/machine/default.png'
}

/**
 * 머신의 난이도 색상을 반환합니다.
 */
export function getDifficultyColor(difficulty: DifficultyLevel): string {
  const colors = {
    beginner: '#22c55e',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
    expert: '#8b5cf6',
  }
  return colors[difficulty] || '#6b7280'
}

/**
 * 머신의 카테고리 색상을 반환합니다.
 */
export function getCategoryColor(category: MachineCategory): string {
  const colors = {
    chest: '#ff6b6b',
    back: '#4ecdc4',
    legs: '#45b7d1',
    shoulders: '#96ceb4',
    arms: '#feca57',
    cardio: '#ff9ff3',
    core: '#54a0ff',
    fullbody: '#5f27cd',
  }
  return colors[category] || '#6b7280'
}

/**
 * 머신의 난이도 한글명을 반환합니다.
 */
export function getDifficultyName(difficulty: DifficultyLevel): string {
  const names = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급',
    expert: '전문가',
  }
  return names[difficulty] || difficulty
}

/**
 * 머신의 카테고리 한글명을 반환합니다.
 */
export function getCategoryName(category: MachineCategory): string {
  const names = {
    chest: '가슴',
    back: '등',
    legs: '하체',
    shoulders: '어깨',
    arms: '팔',
    cardio: '유산소',
    core: '코어',
    fullbody: '전신',
  }
  return names[category] || category
}

/**
 * 머신 데이터를 정렬합니다.
 */
export function sortMachines(
  machines: Machine[],
  sortBy: 'name' | 'category' | 'difficulty' | 'id' = 'name',
  order: 'asc' | 'desc' = 'asc'
): Machine[] {
  return [...machines].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortBy) {
      case 'name':
        aValue = a.nameKo
        bValue = b.nameKo
        break
      case 'category':
        aValue = a.category
        bValue = b.category
        break
      case 'difficulty':
        const difficultyOrder = {
          beginner: 1,
          intermediate: 2,
          advanced: 3,
          expert: 4,
        }
        aValue = difficultyOrder[a.difficulty]
        bValue = difficultyOrder[b.difficulty]
        break
      case 'id':
        aValue = a.id
        bValue = b.id
        break
      default:
        aValue = a.nameKo
        bValue = b.nameKo
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return order === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })
}

/**
 * 머신 데이터를 페이지네이션합니다.
 */
export function paginateMachines(
  machines: Machine[],
  page: number,
  pageSize: number
): { machines: Machine[]; totalPages: number; currentPage: number } {
  const totalPages = Math.ceil(machines.length / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedMachines = machines.slice(startIndex, endIndex)

  return {
    machines: paginatedMachines,
    totalPages,
    currentPage: page,
  }
}
