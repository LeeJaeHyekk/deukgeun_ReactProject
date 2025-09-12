import { Gym } from '../types'

// 백엔드 API 기본 URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export interface SmartSearchResponse {
  searchType: 'location' | 'gym' | 'mixed' | 'profanity_filtered'
  exactMatch?: Gym
  nearbyGyms: Gym[]
  totalCount: number
  originalQuery: string
  locationFilter: string | null
  gymFilter: string | null
  isProfanityFiltered: boolean
}

export interface SearchParams {
  query: string
  latitude?: number
  longitude?: number
  radius?: number
}

/**
 * 스마트 검색 API 호출
 * 지역/헬스장명을 구분하여 검색
 */
export async function smartSearchGyms(
  params: SearchParams
): Promise<SmartSearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/gyms/search/smart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || '검색 실패')
    }

    return result.data
  } catch (error) {
    console.error('스마트 검색 API 오류:', error)
    throw error
  }
}

/**
 * 주변 헬스장 검색 API 호출
 * 위치 기반으로 주변 헬스장을 검색
 */
export async function getNearbyGyms(
  latitude: number,
  longitude: number,
  radius: number = 5
): Promise<Gym[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/gyms/search/nearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude,
        longitude,
        radius,
      }),
    })

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || '주변 헬스장 검색 실패')
    }

    return result.data
  } catch (error) {
    console.error('주변 헬스장 검색 API 오류:', error)
    throw error
  }
}

/**
 * 기본 헬스장 검색 API 호출
 */
export async function searchGyms(query: string): Promise<Gym[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/gyms/search?query=${encodeURIComponent(query)}`
    )

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || '검색 실패')
    }

    return result.data
  } catch (error) {
    console.error('헬스장 검색 API 오류:', error)
    throw error
  }
}

/**
 * 모든 헬스장 목록 조회
 */
export async function getAllGyms(): Promise<Gym[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/gyms`)

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || '헬스장 목록 조회 실패')
    }

    return result.data
  } catch (error) {
    console.error('헬스장 목록 조회 API 오류:', error)
    throw error
  }
}
