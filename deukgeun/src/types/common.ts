// ============================================================================
// 공통 유틸리티 타입
// ============================================================================

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type ApiResponse<T = unknown> = {
  success: boolean
  message: string
  data?: T
  error?: string
}

export type PaginationParams = {
  page?: number
  limit?: number
  offset?: number
}

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type ErrorResponse = {
  success: false
  message: string
  error: string
  statusCode?: number
}

// ============================================================================
// 사용자 관련 타입
// ============================================================================
export type UserRole = "user" | "admin"
export type Gender = "male" | "female" | "other"

export interface User {
  id: number
  email: string
  nickname: string
  phone?: string
  gender?: Gender
  birthday?: Date
  profileImage?: string
  role: UserRole
  accessToken?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile extends Omit<User, "accessToken"> {}

// ============================================================================
// 레벨 시스템 관련 타입
// ============================================================================
export interface UserLevel {
  userId: number
  level: number
  currentExp: number
  totalExp: number
  seasonExp: number
  createdAt: Date
  updatedAt: Date
}

export interface ExpHistory {
  userId: number
  actionType: string
  expGained: number
  source: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

export type RewardType = "badge" | "achievement" | "item"

export interface UserReward {
  userId: number
  rewardType: RewardType
  rewardId: string
  claimedAt?: Date
  expiresAt?: Date
  metadata?: Record<string, unknown>
}

export interface UserStreak {
  userId: number
  streakType: string
  currentCount: number
  lastActivity: Date
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// 워크아웃 관련 타입
// ============================================================================

// 워크아웃 세션
export interface WorkoutSession {
  session_id: number
  user_id: number
  plan_id?: number
  gym_id?: number
  session_name: string
  start_time: Date
  end_time?: Date
  total_duration_minutes?: number
  mood_rating?: number
  energy_level?: number
  notes?: string
  status: "in_progress" | "completed" | "paused" | "cancelled"
  created_at: Date
  updated_at: Date
}

// 운동 세트
export interface ExerciseSet {
  set_id: number
  session_id: number
  machine_id: number
  set_number: number
  reps_completed: number
  weight_kg?: number
  duration_seconds?: number
  distance_meters?: number
  rpe_rating?: number
  notes?: string
  created_at: Date
}

// 워크아웃 목표
export interface WorkoutGoal {
  goal_id: number
  user_id: number
  goal_type:
    | "weight_lift"
    | "endurance"
    | "weight_loss"
    | "muscle_gain"
    | "strength"
    | "flexibility"
  target_value: number
  current_value: number
  unit: string
  target_date: Date
  start_date: Date
  status: "active" | "completed" | "paused" | "cancelled"
  progress_percentage: number
  created_at: Date
  updated_at: Date
}

// 워크아웃 통계
export interface WorkoutStats {
  stat_id: number
  user_id: number
  machine_id?: number
  workout_date: Date
  total_sessions: number
  total_duration_minutes: number
  total_sets: number
  total_reps: number
  total_weight_kg: number
  total_distance_meters: number
  average_mood: number
  average_energy: number
  average_rpe: number
  calories_burned: number
  created_at: Date
  updated_at: Date
}

// 워크아웃 진행 상황
export interface WorkoutProgress {
  progress_id: number
  user_id: number
  machine_id: number
  progress_date: Date
  set_number: number
  reps_completed: number
  weight_kg?: number
  duration_seconds?: number
  distance_meters?: number
  rpe_rating?: number
  notes?: string
  is_personal_best: boolean
  improvement_percentage?: number
  created_at: Date
  updated_at: Date
}

// 워크아웃 알림
export interface WorkoutReminder {
  reminder_id: number
  user_id: number
  title: string
  description?: string
  reminder_time: string
  repeat_days: number[]
  is_active: boolean
  is_sent: boolean
  last_sent_at?: Date
  next_send_at?: Date
  notification_type: "push" | "email" | "sms"
  created_at: Date
  updated_at: Date
}

// 워크아웃 플랜
export interface WorkoutPlan {
  plan_id: number
  user_id: number
  name: string
  description?: string
  difficulty_level: "beginner" | "intermediate" | "advanced"
  estimated_duration_minutes: number
  target_muscle_groups?: string[]
  is_template: boolean
  is_public: boolean
  created_at: Date
  updated_at: Date
}
