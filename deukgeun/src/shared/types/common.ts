// ============================================================================
// 공통 타입 정의
// ============================================================================

// 기본 유틸리티 타입
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// API 응답 기본 타입
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
  statusCode?: number
}

// 페이지네이션 타입
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 에러 응답 타입
export interface ErrorResponse {
  success: false
  message: string
  error: string
  statusCode?: number
}

// 성공 응답 타입
export interface SuccessResponse<T = unknown> {
  success: true
  message: string
  data: T
  statusCode?: number
}

// 공통 상태 타입
export interface LoadingState {
  isLoading: boolean
  error?: string | null
  lastUpdated?: Date
}

// ID 타입
export type ID = number | string

// 날짜 관련 타입
export type DateString = string // ISO 8601 형식
export type TimeString = string // HH:mm:ss 형식

// 사용자 역할
export type UserRole = "user" | "admin" | "moderator"

// 성별
export type Gender = "male" | "female" | "other"

// 사용자 기본 정보
export interface User {
  id: number
  email: string
  username: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// 사용자 프로필
export interface UserProfile {
  id: number
  userId: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  nickname?: string
  avatar?: string
  bio?: string
  gender?: Gender
  birthDate?: Date
  phone?: string
  address?: string
  preferences?: Record<string, unknown>
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// 공통 워크아웃 타입 정의
// ============================================================================

// 운동 계획 관련 타입
export interface WorkoutPlan {
  id: number
  userId: number
  name: string
  description?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDurationMinutes: number
  targetMuscleGroups?: string[]
  isTemplate: boolean
  isPublic: boolean
  exercises: WorkoutPlanExercise[]
  status: "active" | "archived" | "draft"
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutPlanExercise {
  id: number
  planId: number
  machineId?: number
  exerciseName: string
  exerciseOrder: number
  order?: number // 프론트엔드 호환성을 위한 별칭
  sets: number
  repsRange: { min: number; max: number }
  reps?: number // 단일 값으로도 사용 가능
  weightRange?: { min: number; max: number }
  weight?: number // 단일 값으로도 사용 가능
  restSeconds: number
  restTime?: number // 프론트엔드 호환성을 위한 별칭
  notes?: string
  isCompleted?: boolean
  progress?: number
  createdAt: Date
  updatedAt: Date
}

// 운동 세션 관련 타입
export interface WorkoutSession {
  id: number
  userId: number
  planId?: number
  gymId?: number
  name: string
  startTime: Date
  endTime?: Date
  totalDurationMinutes?: number
  duration?: number // 프론트엔드 호환성을 위한 별칭
  moodRating?: number
  energyLevel?: number
  notes?: string
  status: "in_progress" | "completed" | "paused" | "cancelled"
  exerciseSets: ExerciseSet[]
  plan?: WorkoutPlan
  createdAt: Date
  updatedAt: Date
}

export interface ExerciseSet {
  id: number
  sessionId: number
  machineId: number
  exerciseName: string
  setNumber: number
  repsCompleted: number
  weightKg?: number
  durationSeconds?: number
  distanceMeters?: number
  rpeRating?: number
  notes?: string
  isPersonalBest: boolean
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

// 운동 목표 관련 타입
export interface WorkoutGoal {
  id: number
  goal_id?: number // 호환성을 위한 별칭
  userId: number
  title: string
  description?: string
  type: "weight" | "reps" | "duration" | "frequency" | "streak"
  targetValue: number
  currentValue: number
  unit: string
  deadline?: Date
  isCompleted: boolean
  completedAt?: Date
  planId?: number
  exerciseId?: number
  createdAt: Date
  updatedAt: Date
}

// 기구 관련 타입
export interface Machine {
  id: number
  name: string
  imageUrl?: string
  category: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

// 헬스장 관련 타입
export interface Gym {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Workout Core Types
// ============================================================================

// 운동 계획 타입
export interface WorkoutPlan {
  id: number
  userId: number
  name: string
  description?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDurationMinutes: number
  targetMuscleGroups?: string[]
  isTemplate: boolean
  isPublic: boolean
  exercises: WorkoutPlanExercise[]
  status: "active" | "archived" | "draft"
  goals?: WorkoutGoal[]
  sessions?: WorkoutSession[]
  createdAt: Date
  updatedAt: Date
}

// 운동 계획 운동 타입
export interface WorkoutPlanExercise {
  id: number
  planId: number
  machineId?: number
  exerciseId?: number // 프론트엔드 호환성을 위한 속성
  exerciseName: string
  exerciseOrder: number
  sets: number
  repsRange: { min: number; max: number }
  weightRange?: { min: number; max: number }
  restSeconds: number
  notes?: string
  isCompleted?: boolean
  progress?: number
  createdAt: Date
  updatedAt: Date
}

// 운동 세션 타입
export interface WorkoutSession {
  id: number
  userId: number
  planId?: number
  gymId?: number
  name: string
  startTime: Date
  endTime?: Date
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  status: "in_progress" | "completed" | "paused" | "cancelled"
  exerciseSets: ExerciseSet[]
  plan?: WorkoutPlan
  createdAt: Date
  updatedAt: Date
}

// 대시보드 데이터 타입
export interface DashboardData {
  totalWorkouts: number
  totalSessions: number
  totalGoals: number
  completedGoals: number
  currentStreak: number
  totalExp: number
  level: number
  summary: {
    totalWorkouts: number
    totalGoals: number
    totalSessions: number
    totalPlans: number
    completedSessions: number
    streak: number
    activeGoals: number
  }
  weeklyStats: {
    totalSessions: number
    totalDuration: number
    averageMood: number
    averageEnergy: number
  }
  recentSessions: Array<{
    id: number
    name: string
    date: Date
    duration: number
  }>
  activeGoals: Array<{
    id: number
    title: string
    type: string
    targetValue: number
    currentValue: number
    unit: string
    deadline?: Date
    isCompleted: boolean
  }>
  recentProgress: Array<{
    date: Date
    value: number
    type: string
  }>
  upcomingGoals: Array<{
    id: number
    title: string
    deadline: Date
    progress: number
  }>
  weeklyProgress: Array<{
    date: Date
    workouts: number
    exp: number
  }>
}

// ============================================================================
// API 요청/응답 타입 정의
// ============================================================================

// 운동 계획 요청 타입
export interface CreatePlanRequest {
  name: string
  description?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDurationMinutes: number
  targetMuscleGroups?: string[]
  isTemplate?: boolean
  isPublic?: boolean
  exercises: Array<{
    machineId?: number
    exerciseName: string
    exerciseOrder: number
    sets: number
    repsRange: { min: number; max: number }
    weightRange?: { min: number; max: number }
    restSeconds: number
    notes?: string
  }>
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {
  id: number
}

// 운동 세션 요청 타입
export interface CreateSessionRequest {
  planId?: number
  gymId?: number
  name: string
  startTime: Date
  notes?: string
}

export interface UpdateSessionRequest extends Partial<CreateSessionRequest> {
  id: number
  endTime?: Date
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  status?: "in_progress" | "completed" | "paused" | "cancelled"
}

// 운동 목표 요청 타입
export interface CreateGoalRequest {
  title: string
  description?: string
  type: "weight" | "reps" | "duration" | "frequency" | "streak"
  targetValue: number
  currentValue?: number
  unit: string
  deadline?: Date
  planId?: number
  exerciseId?: number
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {
  id: number
  isCompleted?: boolean
  completedAt?: Date
}

// 운동 세트 요청 타입
export interface CreateExerciseSetRequest {
  sessionId: number
  machineId: number
  exerciseName: string
  setNumber: number
  repsCompleted: number
  weightKg?: number
  durationSeconds?: number
  distanceMeters?: number
  rpeRating?: number
  notes?: string
  isPersonalBest?: boolean
  isCompleted?: boolean
}

export interface UpdateExerciseSetRequest
  extends Partial<CreateExerciseSetRequest> {
  id: number
}
