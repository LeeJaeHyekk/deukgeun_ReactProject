// 공통 타입 정의
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

// 경험치 액션 타입
export type ExpActionType =
  | "workout_complete"
  | "streak_bonus"
  | "level_up"
  | "achievement_unlock"
  | "daily_login"
  | "post_create"
  | "comment_create"
  | "like_receive"

// 리워드 타입
export type RewardType = "exp_bonus" | "badge" | "title" | "item"

// 마일스톤 타입
export type MilestoneType =
  | "workout_count"
  | "streak_days"
  | "level_reached"
  | "achievement_unlocked"

// 스트릭 타입
export type StreakType = "daily_workout" | "weekly_workout" | "monthly_workout"

// 머신 카테고리
export type MachineCategory =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "cardio"
  | "full_body"

// 난이도 레벨
export type DifficultyLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert"

// 포스트 카테고리
export type PostCategory =
  | "general"
  | "workout_tip"
  | "nutrition"
  | "motivation"
  | "question"
  | "achievement"

// 사용자 역할
export type UserRole = "user" | "admin" | "moderator" | "super_admin"

// 운동 세션 상태
export type WorkoutSessionStatus =
  | "active"
  | "completed"
  | "paused"
  | "cancelled"

// 운동 계획 상태
export type WorkoutPlanStatus = "draft" | "active" | "completed" | "archived"

// 운동 목표 상태
export type WorkoutGoalStatus = "active" | "completed" | "paused" | "cancelled"
