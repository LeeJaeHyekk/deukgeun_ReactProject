import { Gym, FilterOption, SortOption, SortDirection } from '../types'
import { calculateDistanceFromCurrent } from './distanceUtils'

/**
 * 헬스장 필터링 및 정렬 유틸리티
 */

// 필터링 로직
export function filterGyms(
  gyms: Gym[],
  activeFilters: FilterOption[],
  currentPosition: { lat: number; lng: number } | null
): Gym[] {
  if (activeFilters.length === 0) {
    return gyms
  }

  return gyms.filter(gym => {
    // 거리 계산 (필터링에 사용)
    if (currentPosition) {
      gym.distance = calculateDistanceFromCurrent(currentPosition, gym)
    }

    // 각 필터 조건 확인
    return activeFilters.every(filter => {
      switch (filter) {
        case 'PT':
          return gym.hasPT === true
        case 'GX':
          return gym.hasGX === true
        case '24시간':
          return gym.is24Hours === true
        case '주차':
          return gym.hasParking === true
        case '샤워':
          return gym.hasShower === true
        default:
          return true
      }
    })
  })
}

// 정렬 로직
export function sortGyms(
  gyms: Gym[],
  sortBy: SortOption,
  direction: SortDirection = 'asc'
): Gym[] {
  const sortedGyms = [...gyms]

  sortedGyms.sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortBy) {
      case 'distance':
        aValue = a.distance || Infinity
        bValue = b.distance || Infinity
        break
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'rating':
        aValue = a.rating || 0
        bValue = b.rating || 0
        break
      case 'reviewCount':
        aValue = a.reviewCount || 0
        bValue = b.reviewCount || 0
        break
      case 'price':
        aValue = parsePrice(a.price)
        bValue = parsePrice(b.price)
        break
      default:
        return 0
    }

    if (direction === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    }
  })

  return sortedGyms
}

// 가격 문자열을 숫자로 파싱 (예: "10만원" -> 100000)
function parsePrice(price?: string): number {
  if (!price) return 0

  const match = price.match(/(\d+(?:\.\d+)?)/)
  if (!match) return 0

  const number = parseFloat(match[1])

  if (price.includes('만원')) {
    return number * 10000
  } else if (price.includes('천원')) {
    return number * 1000
  }

  return number
}

// 거리 기반 필터링 (특정 반경 내)
export function filterGymsByDistance(
  gyms: Gym[],
  maxDistance: number,
  currentPosition: { lat: number; lng: number }
): Gym[] {
  return gyms.filter(gym => {
    const distance = calculateDistanceFromCurrent(currentPosition, gym)
    return distance <= maxDistance
  })
}

// 통합 필터링 및 정렬 함수
export function processGyms(
  gyms: Gym[],
  options: {
    activeFilters: FilterOption[]
    sortBy: SortOption
    sortDirection: SortDirection
    maxDistance?: number
    currentPosition: { lat: number; lng: number } | null
  }
): Gym[] {
  let processedGyms = [...gyms]
  console.log('🔍 processGyms 시작:', {
    inputCount: gyms.length,
    maxDistance: options.maxDistance,
  })

  // 1. 거리 계산 추가
  if (options.currentPosition) {
    processedGyms = processedGyms.map(gym => ({
      ...gym,
      distance: calculateDistanceFromCurrent(options.currentPosition!, gym),
    }))
    console.log('🔍 거리 계산 후:', {
      count: processedGyms.length,
      distances: processedGyms.map(g => ({
        name: g.name,
        distance: g.distance,
      })),
    })
  }

  // 2. 거리 기반 필터링 (임시 비활성화 - 백엔드에서 이미 거리 필터링됨)
  if (false && options.maxDistance && options.currentPosition) {
    const beforeCount = processedGyms.length
    processedGyms = filterGymsByDistance(
      processedGyms,
      options.maxDistance!,
      options.currentPosition!
    )
    console.log('🔍 거리 필터링 후:', {
      beforeCount,
      afterCount: processedGyms.length,
      maxDistance: options.maxDistance,
      filtered: processedGyms.map(g => ({
        name: g.name,
        distance: g.distance,
      })),
    })
  }

  // 3. 필터링
  const beforeFilterCount = processedGyms.length
  processedGyms = filterGyms(
    processedGyms,
    options.activeFilters,
    options.currentPosition
  )
  console.log('🔍 필터링 후:', {
    beforeCount: beforeFilterCount,
    afterCount: processedGyms.length,
    activeFilters: options.activeFilters,
  })

  // 4. 정렬
  processedGyms = sortGyms(processedGyms, options.sortBy, options.sortDirection)
  console.log('🔍 정렬 후:', {
    count: processedGyms.length,
    sortBy: options.sortBy,
    sortDirection: options.sortDirection,
  })

  return processedGyms
}
