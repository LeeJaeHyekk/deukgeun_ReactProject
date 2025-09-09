// ============================================================================
// Workout Types
// ============================================================================

export * from "./dto"

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

export interface WorkoutSessionSearchParams {
  userId?: number
  gymId?: number
  planId?: number
  status?: "planned" | "in_progress" | "completed" | "cancelled"
  startDate?: Date
  endDate?: Date
}

export interface ExerciseSetSearchParams {
  sessionId?: number
  machineId?: number
  setNumber?: number
}

export interface WorkoutPlanSearchParams {
  userId?: number
  isPublic?: boolean
  difficulty?: "beginner" | "intermediate" | "advanced"
  name?: string
}

export interface WorkoutStatsSearchParams {
  userId?: number
  machineId?: number
  startDate?: Date
  endDate?: Date
}
