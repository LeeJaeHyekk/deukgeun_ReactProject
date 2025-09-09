// ============================================================================
// Stats Types
// ============================================================================

export interface WorkoutStatsDTO {
  id: number
  userId: number
  machineId: number
  totalSessions: number
  totalSets: number
  totalReps: number
  totalWeight: number
  totalDuration: number
  averageWeight: number
  averageReps: number
  personalBest: number
  lastWorkoutDate?: Date
  createdAt: Date
  updatedAt: Date
  user?: {
    id: number
    nickname: string
    profileImage?: string
  }
  machine?: {
    id: number
    name: string
    category: string
    difficulty: string
  }
}

export interface UserStatsDTO {
  userId: number
  totalWorkouts: number
  totalDuration: number
  totalCalories: number
  averageWorkoutDuration: number
  favoriteMachine: string
  currentStreak: number
  longestStreak: number
  level: number
  experience: number
  achievements: number
  createdAt: Date
  updatedAt: Date
}

export interface MachineStatsDTO {
  machineId: number
  totalUsers: number
  totalSessions: number
  totalSets: number
  averageWeight: number
  averageReps: number
  popularity: number
  createdAt: Date
  updatedAt: Date
}

export interface GymStatsDTO {
  gymId: number
  totalUsers: number
  totalSessions: number
  averageSessionsPerUser: number
  peakHours: string[]
  popularMachines: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ErrorResponse {
  success: false
  error: string
  message?: string
  code?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface StatsSearchParams {
  userId?: number
  machineId?: number
  gymId?: number
  startDate?: Date
  endDate?: Date
  period?: "daily" | "weekly" | "monthly" | "yearly"
}
