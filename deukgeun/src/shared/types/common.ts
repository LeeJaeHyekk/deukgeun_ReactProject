// ============================================================================
// 공통 유틸리티 타입들
// ============================================================================

// 기본 ID 타입
export type ID = string | number

// 날짜 문자열 타입
export type DateString = string

// 기본 엔티티 타입
export interface BaseEntity {
  id: ID
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  nickname: string
  profileImage?: string
  level: number
  experience: number
  maxExperience: number
  createdAt: Date
  updatedAt: Date
  accessToken?: string
}

export interface LevelProgress {
  level: number
  currentExp: number
  totalExp: number
  seasonExp: number
  expToNextLevel: number
  progressPercentage: number
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number
  limit: number
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
    hasNext: boolean
    hasPrev: boolean
  }
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

// API 에러 타입
export interface ApiError {
  message: string
  status: number
  code?: string
  details?: any
}

// 로딩 상태 타입
export interface LoadingState {
  isLoading: boolean
  error: string | null
  lastUpdated?: Date
}

// 선택 상태 타입
export interface Selectable<T> {
  selected: boolean
  data: T
}

// 필터 타입
export interface Filter<T = any> {
  field: keyof T
  operator:
    | "eq"
    | "ne"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "contains"
    | "in"
    | "notIn"
  value: any
}

// 정렬 타입
export interface Sort<T = any> {
  field: keyof T
  order: "asc" | "desc"
}

// 검색 타입
export interface SearchParams {
  query: string
  fields?: string[]
  fuzzy?: boolean
}

// 날짜 범위 타입
export interface DateRange {
  start: Date
  end: Date
}

// 파일 업로드 타입
export interface FileUpload {
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
  url?: string
  error?: string
}

// 알림 타입
export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// 모달 타입
export interface ModalState {
  isOpen: boolean
  data?: any
}

// 폼 상태 타입
export interface FormState<T = any> {
  data: T
  errors: Partial<Record<keyof T, string>>
  isDirty: boolean
  isValid: boolean
  isSubmitting: boolean
}

// 워크아웃 관련 타입들
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
  status: "active" | "archived" | "draft"
  exercises: WorkoutPlanExercise[]
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutPlanExercise {
  id: number
  planId: number
  machineId?: number
  exerciseName: string
  exerciseOrder: number
  sets: number
  repsRange: { min: number; max: number }
  weightRange?: { min: number; max: number }
  restSeconds: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

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
  createdAt: Date
  updatedAt: Date
}

export interface ExerciseSet {
  id: number
  userId: number
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

export interface WorkoutGoal {
  id: number
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

export interface Machine {
  id: string
  name: string
  category: string
  description?: string
  imageUrl?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  targetMuscleGroups: string[]
  instructions?: string
  safetyTips?: string
  createdAt: Date
  updatedAt: Date
}

export interface Gym {
  id: string
  name: string
  address: string
  phone?: string
  website?: string
  operatingHours?: string
  facilities?: string[]
  latitude?: number
  longitude?: number
  createdAt: Date
  updatedAt: Date
}

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

// 요청/응답 타입들
export interface CreatePlanRequest {
  name: string
  description?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDurationMinutes: number
  targetMuscleGroups?: string[]
  isTemplate?: boolean
  isPublic?: boolean
  exercises: WorkoutPlanExercise[]
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {
  id: number
}

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
  id: string
}
