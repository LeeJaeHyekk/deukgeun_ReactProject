// ============================================================================
// Level Types
// ============================================================================

export * from "./dto"

export type ExpActionType =
  | "workout_completed"
  | "workout_streak"
  | "first_workout"
  | "level_up"
  | "post_created"
  | "comment_created"
  | "like_received"
  | "achievement_unlocked"
  | "daily_login"
  | "weekly_goal"
  | "monthly_goal"

export type RewardType =
  | "badge"
  | "title"
  | "avatar_frame"
  | "background"
  | "special_access"
  | "discount"
  | "free_item"

export type MilestoneType =
  | "workout_count"
  | "streak_days"
  | "total_experience"
  | "level_reached"
  | "achievement_count"
  | "community_activity"
  | "time_spent"

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

export interface LevelConfig {
  level: number
  requiredExp: number
  totalExp: number
  rewards: string[]
  milestones: string[]
}

export interface ExpGrantData {
  userId: number
  actionType: ExpActionType
  points: number
  description: string
  metadata?: Record<string, any>
}
