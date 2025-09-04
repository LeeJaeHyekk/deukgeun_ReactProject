import api from './client'

// 레벨 관련 타입들
export interface LevelProgress {
  userId: string
  currentLevel: number
  currentExp: number
  nextLevelExp: number
  progressPercentage: number
}

export interface UserReward {
  id: string
  userId: string
  rewardType: string
  rewardValue: string
  earnedAt: Date
  isClaimed: boolean
}

// 레벨 관련 API 함수들
export const levelApi = {
  // 사용자 레벨 정보 조회
  getUserLevel: async (userId: string): Promise<LevelProgress> => {
    const response = await api.get(`/level/user/${userId}`)
    return response.data as LevelProgress
  },

  // 경험치 획득
  gainExperience: async (userId: string, expAmount: number, source: string) => {
    const response = await api.post(`/level/user/${userId}/exp`, {
      expAmount,
      source
    })
    return response.data
  },

  // 레벨업 확인
  checkLevelUp: async (userId: string) => {
    const response = await api.get(`/level/user/${userId}/check-levelup`)
    return response.data
  },

  // 사용자 보상 조회
  getUserRewards: async (userId: string) => {
    const response = await api.get(`/level/user/${userId}/rewards`)
    return response.data as UserReward[]
  },

  // 보상 수령
  claimReward: async (rewardId: string) => {
    const response = await api.post(`/level/rewards/${rewardId}/claim`)
    return response.data
  },

  // 레벨 정보 조회
  getLevelInfo: async (level: number) => {
    const response = await api.get(`/level/info/${level}`)
    return response.data
  },

  // 전체 레벨 정보 조회
  getAllLevels: async () => {
    const response = await api.get('/level/all')
    return response.data
  }
}
