import { Gym } from '../types'

export interface OptimizedSearchParams {
  query?: string
  latitude?: number
  longitude?: number
  radius?: number
  is24Hours?: boolean
  hasPT?: boolean
  hasGX?: boolean
  hasParking?: boolean
  hasShower?: boolean
  limit?: number
  offset?: number
}

export interface OptimizedSearchResponse {
  success: boolean
  data: Gym[]
  pagination?: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  message?: string
  error?: string
}

export interface GymStatsResponse {
  success: boolean
  data: {
    regionStats: Array<{
      region: string
      count: number
      avgLatitude: number
      avgLongitude: number
    }>
    facilityStats: {
      totalGyms: number
      facilities: {
        is24Hours: number
        hasPT: number
        hasGX: number
        hasParking: number
        hasShower: number
      }
    }
  }
  message?: string
  error?: string
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

/**
 * 최적화된 헬스장 검색 API
 */
export async function optimizedSearchGyms(
  params: OptimizedSearchParams
): Promise<OptimizedSearchResponse> {
  try {
    const searchParams = new URLSearchParams()

    // 쿼리 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(
      `${API_BASE_URL}/gyms/search?${searchParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('최적화된 헬스장 검색 실패:', error)
    throw error
  }
}

/**
 * 주변 헬스장 검색 (최적화된 버전)
 */
export async function getOptimizedNearbyGyms(
  latitude: number,
  longitude: number,
  radius: number = 5,
  limit: number = 20
): Promise<OptimizedSearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/gyms/search/location`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const searchParams = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
      limit: limit.toString(),
    })

    const url = `${API_BASE_URL}/gyms/search/location?${searchParams}`
    const finalResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!finalResponse.ok) {
      throw new Error(`HTTP error! status: ${finalResponse.status}`)
    }

    return await finalResponse.json()
  } catch (error) {
    console.error('최적화된 주변 헬스장 검색 실패:', error)
    throw error
  }
}

/**
 * 헬스장명 자동완성 API
 */
export async function getGymNameSuggestions(
  query: string,
  limit: number = 10
): Promise<{
  success: boolean
  data: string[]
  message?: string
  error?: string
}> {
  try {
    const searchParams = new URLSearchParams({
      query,
      limit: limit.toString(),
    })

    const response = await fetch(
      `${API_BASE_URL}/gyms/search/suggestions?${searchParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('헬스장명 자동완성 실패:', error)
    throw error
  }
}

/**
 * 헬스장 통계 API
 */
export async function getGymStats(): Promise<GymStatsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/gyms/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('헬스장 통계 조회 실패:', error)
    throw error
  }
}

/**
 * 스마트 검색 (기존 API와 호환)
 */
export async function smartSearchGyms(params: {
  query: string
  latitude: number
  longitude: number
  radius?: number
}): Promise<OptimizedSearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/gyms/search/smart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('스마트 검색 실패:', error)
    throw error
  }
}

/**
 * 캐시를 활용한 검색 (브라우저 캐시 활용)
 */
export class CachedGymSearchService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5분

  private getCacheKey(params: OptimizedSearchParams): string {
    return JSON.stringify(params)
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  async searchGyms(
    params: OptimizedSearchParams
  ): Promise<OptimizedSearchResponse> {
    const cacheKey = this.getCacheKey(params)
    const cached = this.cache.get(cacheKey)

    // 캐시가 유효한 경우 캐시된 데이터 반환
    if (cached && this.isCacheValid(cached.timestamp)) {
      console.log('📦 캐시된 검색 결과 사용:', cacheKey)
      return cached.data
    }

    // 캐시가 없거나 만료된 경우 API 호출
    console.log('🌐 API 호출로 검색 결과 가져오기:', cacheKey)
    const result = await optimizedSearchGyms(params)

    // 결과를 캐시에 저장
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    })

    return result
  }

  clearCache(): void {
    this.cache.clear()
    console.log('🗑️ 검색 캐시가 초기화되었습니다.')
  }

  getCacheSize(): number {
    return this.cache.size
  }
}

// 싱글톤 인스턴스
export const cachedGymSearchService = new CachedGymSearchService()
