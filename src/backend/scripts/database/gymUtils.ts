// 헬스장 유틸리티 함수들

export interface GymData {
  id: string
  name: string
  address: string
  phone?: string
  category?: string
  [key: string]: any
}

/**
 * 헬스장 데이터를 필터링합니다.
 * @param gyms - 헬스장 데이터 배열
 * @param filters - 필터 조건
 * @returns 필터링된 헬스장 배열
 */
export function filterGyms(
  gyms: GymData[],
  filters: {
    category?: string
    region?: string
    name?: string
  } = {}
): GymData[] {
  return gyms.filter(gym => {
    // 카테고리 필터
    if (filters.category && gym.category !== filters.category) {
      return false
    }

    // 지역 필터
    if (filters.region && !gym.address.includes(filters.region)) {
      return false
    }

    // 이름 필터
    if (
      filters.name &&
      !gym.name.toLowerCase().includes(filters.name.toLowerCase())
    ) {
      return false
    }

    return true
  })
}

/**
 * 헬스장 데이터를 정제합니다.
 * @param gym - 정제할 헬스장 데이터
 * @returns 정제된 헬스장 데이터
 */
export function sanitizeGymData(gym: GymData): GymData {
  return {
    ...gym,
    name: gym.name.trim(),
    address: gym.address.trim(),
    phone: gym.phone?.trim() || undefined,
    category: gym.category?.trim() || undefined,
  }
}

/**
 * 헬스장 데이터를 검증합니다.
 * @param gym - 검증할 헬스장 데이터
 * @returns 검증 결과
 */
export function validateGymData(gym: GymData): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!gym.name || gym.name.trim().length === 0) {
    errors.push("헬스장 이름은 필수입니다.")
  }

  if (!gym.address || gym.address.trim().length === 0) {
    errors.push("주소는 필수입니다.")
  }

  if (gym.name && gym.name.length > 100) {
    errors.push("헬스장 이름은 100자를 초과할 수 없습니다.")
  }

  if (gym.address && gym.address.length > 200) {
    errors.push("주소는 200자를 초과할 수 없습니다.")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
