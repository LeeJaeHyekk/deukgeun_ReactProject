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

export const statsApi = {
  // 플랫폼 기본 통계 조회
  getPlatformStats: async (): Promise<PlatformStats> => {
    const response = await apiClient.get("/api/stats/platform")
    return response.data.data
  },

  // 상세 통계 조회 (관리자용)
  getDetailedStats: async (): Promise<DetailedStats> => {
    const response = await apiClient.get("/api/stats/detailed")
    return response.data.data
  },

  // 사용자 개인 통계 조회
  getUserStats: async (): Promise<UserStats> => {
    const response = await apiClient.get("/api/stats/user")
    return response.data.data
  },
}
