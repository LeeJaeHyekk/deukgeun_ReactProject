import api from "./client"

// 통계 관련 타입들
export interface PlatformStats {
  totalUsers: number
  totalWorkouts: number
  totalSessions: number
  totalGoals: number
  averageLevel: number
  averageExperience: number
  activeUsers: number
  newUsersThisWeek: number
  totalGyms: number
  totalMachines: number
}

export interface UserStats {
  userId: string
  totalWorkouts: number
  totalSessions: number
  totalGoals: number
  completedGoals: number
  currentStreak: number
  totalExperience: number
  currentLevel: number
  averageWorkoutDuration: number
  favoriteMachine: string
  workoutHistory: Array<{
    date: string
    duration: number
    exercises: number
  }>
}

// 기본 통계값
export const DEFAULT_PLATFORM_STATS: PlatformStats = {
  totalUsers: 0,
  totalWorkouts: 0,
  totalSessions: 0,
  totalGoals: 0,
  averageLevel: 1,
  averageExperience: 0,
  activeUsers: 0,
  newUsersThisWeek: 0,
  totalGyms: 0,
  totalMachines: 0,
}

export const DEFAULT_USER_STATS: UserStats = {
  userId: "",
  totalWorkouts: 0,
  totalSessions: 0,
  totalGoals: 0,
  completedGoals: 0,
  currentStreak: 0,
  totalExperience: 0,
  currentLevel: 1,
  averageWorkoutDuration: 0,
  favoriteMachine: "",
  workoutHistory: [],
}

// 통계 관련 API 함수들
export const statsApi = {
  // 플랫폼 전체 통계 조회
  getPlatformStats: async (): Promise<PlatformStats> => {
    const response = await api.get("/stats/platform")
    return response.data as PlatformStats
  },

  // 사용자 통계 조회
  getUserStats: async (userId: string, period?: string) => {
    const response = await api.get(`/stats/user/${userId}`, period ? { period } : undefined)
    return response.data
  },

  // 워크아웃 통계 조회
  getWorkoutStats: async (userId: string, period?: string) => {
    const response = await api.get(`/stats/workout/${userId}`, period ? { period } : undefined)
    return response.data
  },

  // 레벨 통계 조회
  getLevelStats: async (userId: string) => {
    const response = await api.get(`/stats/level/${userId}`)
    return response.data
  },

  // 헬스장 통계 조회
  getGymStats: async (gymId: string, period?: string) => {
    const response = await api.get(`/stats/gym/${gymId}`, period ? { period } : undefined)
    return response.data
  },

  // 머신 사용 통계 조회
  getMachineStats: async (machineId: string, period?: string) => {
    const response = await api.get(`/stats/machine/${machineId}`, period ? { period } : undefined)
    return response.data
  },

  // 전체 통계 조회
  getOverallStats: async (period?: string) => {
    const response = await api.get("/stats/overall", period ? { period } : undefined)
    return response.data
  },
}
