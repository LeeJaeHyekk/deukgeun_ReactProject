import apiClient from "./index"

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
export const DEFAULT_PLATFORM_STATS: PlatformStats = {
  activeUsers: 150,
  totalGyms: 45,
  totalPosts: 320,
  achievements: 25,
}

export const DEFAULT_USER_STATS: UserStats = {
  level: 1,
  currentExp: 0,
  totalExp: 100,
  totalPosts: 0,
  recentPosts: 0,
}

export const DEFAULT_DETAILED_STATS: DetailedStats = {
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

export const statsApi = {
  // 플랫폼 기본 통계 조회
  getPlatformStats: async (): Promise<PlatformStats> => {
    try {
      const response = await apiClient.get("/api/stats/platform")
      return response.data.data
    } catch (error) {
      console.warn("플랫폼 통계 조회 실패, 기본값 사용:", error)
      return DEFAULT_PLATFORM_STATS
    }
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
