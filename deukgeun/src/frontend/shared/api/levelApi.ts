const apiClient = require('./index').default
const { config  } = require('../config')

export interface LevelProgress {
  level: number
  currentExp: number
  totalExp: number
  seasonExp: number
  expToNextLevel: number
  progressPercentage: number
  levelUp?: boolean
}

export interface UserReward {
  id: number
  userId: number
  rewardType: string
  rewardId: string
  claimedAt: string
  expiresAt?: string
  metadata?: any
}

export interface ExpGrantRequest {
  actionType: string
  source: string
  metadata?: any
}

export interface ExpGrantResponse {
  success: boolean
  expGained: number
  levelUp?: boolean
  level?: number
  currentExp?: number
  totalExp?: number
  leveledUp?: boolean
  cooldownInfo?: { isOnCooldown: boolean; remainingTime: number }
  dailyLimitInfo?: { withinLimit: boolean; dailyExp: number; limit: number }
  rewards?: UserReward[]
}

const levelApi = {
  /**
   * 사용자 레벨 정보 조회
   */
  getUserLevel: async (userId: number) => {
    const response = await apiClient.get(`/api/level/user/${userId}`)
    return response.data
  },

  /**
   * 사용자 레벨 진행률 조회
   */
  getUserProgress: async (userId: number): Promise<LevelProgress> => {
    const response = await apiClient.get(`/api/level/user/${userId}/progress`)
    return response.data.data
  },

  /**
   * 사용자 보상 목록 조회
   */
  getUserRewards: async (userId: number): Promise<UserReward[]> => {
    const response = await apiClient.get(`/api/level/user/${userId}/rewards`)
    return response.data.data
  },

  /**
   * 경험치 부여
   */
  grantExp: async (data: ExpGrantRequest): Promise<ExpGrantResponse> => {
    const response = await apiClient.post("/api/level/exp/grant", data)
    return response.data.data
  },

  /**
   * 쿨다운 상태 확인
   */
  checkCooldown: async (actionType: string, userId: number) => {
    const response = await apiClient.get(
      `/api/level/cooldown/${actionType}/${userId}`
    )
    return response.data.data
  },

  /**
   * 전체 리더보드 조회
   */
  getGlobalLeaderboard: async (page: number = 1, limit: number = 20) => {
    const response = await apiClient.get("/api/level/leaderboard/global", {
      params: { page, limit },
    })
    return response.data.data
  },

  /**
   * 시즌 리더보드 조회
   */
  getSeasonLeaderboard: async (
    seasonId: string,
    page: number = 1,
    limit: number = 20
  ) => {
    const response = await apiClient.get(
      `/api/level/leaderboard/season/${seasonId}`,
      {
        params: { page, limit },
      }
    )
    return response.data.data
  },

  /**
   * 관리자: 레벨 설정 업데이트
   */
  updateLevelConfig: async (config: any) => {
    const response = await apiClient.put("/api/level/admin/config", { config })
    return response.data
  },

  /**
   * 관리자: 사용자 진행률 리셋
   */
  resetUserProgress: async (userId: number) => {
    const response = await apiClient.post(`/api/level/admin/reset/${userId}`)
    return response.data
  },

  /**
   * 관리자: 시스템 통계 조회
   */
  getSystemStats: async () => {
    const response = await apiClient.get("/api/level/admin/stats")
    return response.data.data
  },
}
