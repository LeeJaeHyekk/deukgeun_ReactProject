import apiClient from './index'

// 캐시 관리
let platformStatsCache: PlatformStats | null = null
let userStatsCache: UserStats | null = null
let detailedStatsCache: DetailedStats | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5분

// 중복 요청 방지
let pendingPlatformStatsRequest: Promise<PlatformStats> | null = null

export interface PlatformStats {
  activeUsers: number
  totalGyms: number
  totalPosts: number
  achievements: number
}

export interface DetailedStats {
  monthlyUsers: Array<{
    month: string
    count: number
  }>
  gymDistribution: Array<{
    district: string
    count: number
  }>
  levelDistribution: Array<{
    level: number
    count: number
  }>
}

export interface UserStats {
  level: number
  currentExp: number
  totalExp: number
  totalPosts: number
  recentPosts: number
}

// 기본값 상수
const DEFAULT_PLATFORM_STATS: PlatformStats = {
  activeUsers: 150,
  totalGyms: 45,
  totalPosts: 320,
  achievements: 25,
}

const DEFAULT_USER_STATS: UserStats = {
  level: 1,
  currentExp: 0,
  totalExp: 100,
  totalPosts: 0,
  recentPosts: 0,
}

const DEFAULT_DETAILED_STATS: DetailedStats = {
  monthlyUsers: [
    { month: "2024-01", count: 45 },
    { month: "2024-02", count: 52 },
    { month: "2024-03", count: 38 },
  ],
  gymDistribution: [
    { district: "강남구", count: 12 },
    { district: "서초구", count: 8 },
    { district: "마포구", count: 6 },
  ],
  levelDistribution: [
    { level: 1, count: 80 },
    { level: 2, count: 45 },
    { level: 3, count: 25 },
    { level: 4, count: 15 },
    { level: 5, count: 10 },
  ],
}

const statsApi = {
  // 플랫폼 기본 통계 조회 (캐싱 및 중복 요청 방지 적용)
  getPlatformStats: async (): Promise<PlatformStats> => {
    // 캐시된 데이터가 있고 유효한 경우 반환
    if (platformStatsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
      console.log("📦 플랫폼 통계 캐시 사용")
      return platformStatsCache
    }

    // 이미 진행 중인 요청이 있으면 기다림
    if (pendingPlatformStatsRequest) {
      console.log("🔄 플랫폼 통계 요청 진행 중, 기존 요청 대기")
      return pendingPlatformStatsRequest
    }

    // 새로운 요청 시작
    pendingPlatformStatsRequest = (async () => {
      try {
        console.log("🌐 플랫폼 통계 API 호출")
        const response = await apiClient.get("/api/stats/platform")
        const stats = response.data.data
        
        // 캐시 업데이트
        platformStatsCache = stats
        cacheTimestamp = Date.now()
        
        return stats
      } catch (error) {
        console.warn("플랫폼 통계 조회 실패, 기본값 사용:", error)
        
        // 에러 시에도 기본값을 캐시에 저장하여 반복 호출 방지
        if (!platformStatsCache) {
          platformStatsCache = DEFAULT_PLATFORM_STATS
          cacheTimestamp = Date.now()
        }
        
        return DEFAULT_PLATFORM_STATS
      } finally {
        // 요청 완료 후 pendingRequest 초기화
        pendingPlatformStatsRequest = null
      }
    })()

    return pendingPlatformStatsRequest
  },

  // 상세 통계 조회 (관리자용)
  getDetailedStats: async (): Promise<DetailedStats> => {
    try {
      const response = await apiClient.get("/api/stats/detailed")
      return response.data.data
    } catch (error) {
      console.warn("상세 통계 조회 실패, 기본값 사용:", error)
      return DEFAULT_DETAILED_STATS
    }
  },

  // 사용자 개인 통계 조회
  getUserStats: async (): Promise<UserStats> => {
    try {
      const response = await apiClient.get("/api/stats/user")
      return response.data.data
    } catch (error) {
      console.warn("사용자 통계 조회 실패, 기본값 사용:", error)
      return DEFAULT_USER_STATS
    }
  },
}

// Export all functions and constants
export {
  statsApi,
  DEFAULT_PLATFORM_STATS,
  DEFAULT_USER_STATS,
  DEFAULT_DETAILED_STATS,
}