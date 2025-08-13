// ============================================================================
// 워크아웃 관련 타입
// ============================================================================

// 운동 세션
export interface WorkoutSession {
  id: number
  userId: number
  name: string
  description?: string
  startTime: Date
  endTime?: Date
  duration?: number // 분 단위
  caloriesBurned?: number
  notes?: string
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

// 운동 세트
export interface ExerciseSet {
  id: number
  sessionId: number
  machineId: number
  exerciseName: string
  setNumber: number
  weight: number
  reps: number
  restTime?: number // 초 단위
  notes?: string
  createdAt: Date
}

// 운동 목표
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
  createdAt: Date
  updatedAt: Date
}

// 운동 계획
export interface WorkoutPlan {
  id: number
  userId: number
  name: string
  description?: string
  isActive: boolean
  exercises?: WorkoutPlanExercise[]
  createdAt: Date
  updatedAt: Date
}

// 운동 계획 운동
export interface WorkoutPlanExercise {
  id: number
  planId: number
  machineId: number
  exerciseName: string
  order: number
  sets: number
  reps: number
  weight?: number
  restTime?: number
  notes?: string
}

// 운동 통계
export interface WorkoutStats {
  id: number
  userId: number
  date: Date
  totalWorkouts: number
  totalDuration: number
  totalCalories: number
  totalWeight: number
  totalSets: number
  totalReps: number
  createdAt: Date
  updatedAt: Date
}

// 운동 진행도
export interface WorkoutProgress {
  id: number
  userId: number
  machineId: number
  exerciseName: string
  date: Date
  maxWeight: number
  maxReps: number
  totalSets: number
  totalVolume: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// 운동 알림
export interface WorkoutReminder {
  id: number
  userId: number
  title: string
  message: string
  scheduledTime: Date
  isActive: boolean
  isRepeating: boolean
  repeatDays?: number[] // 0-6 (일요일-토요일)
  createdAt: Date
  updatedAt: Date
}

// 운동 요약
export interface WorkoutSummary {
  id: number
  userId: number
  sessionId: number
  totalSets: number
  totalReps: number
  totalWeight: number
  totalDuration: number
  averageMood: number
  averageEnergy: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// 대시보드 데이터 타입
export interface DashboardData {
  summary: {
    totalPlans: number
    totalSessions: number
    completedSessions: number
    activeGoals: number
  }
  weeklyStats: {
    totalSessions: number
    totalDuration: number
    averageMood: number
    averageEnergy: number
  }
  recentSessions: WorkoutSession[]
  recentProgress: WorkoutProgress[]
  activeGoals: WorkoutGoal[]
}

// 운동 세션 생성 요청
export interface CreateSessionRequest {
  userId: number
  name: string
  description?: string
  startTime: Date
}

// 운동 세션 업데이트 요청
export interface UpdateSessionRequest {
  sessionId: number
  name?: string
  description?: string
  endTime?: Date
  caloriesBurned?: number
  notes?: string
  isCompleted?: boolean
}

// 운동 세트 생성 요청
export interface CreateSetRequest {
  sessionId: number
  machineId: number
  exerciseName: string
  setNumber: number
  weight: number
  reps: number
  restTime?: number
  notes?: string
}

// 운동 세트 업데이트 요청
export interface UpdateSetRequest {
  setId: number
  weight?: number
  reps?: number
  restTime?: number
  notes?: string
}

// 운동 목표 생성 요청
export interface CreateGoalRequest {
  userId: number
  title: string
  description?: string
  type: "weight" | "reps" | "duration" | "frequency" | "streak"
  targetValue: number
  unit: string
  deadline?: Date
}

// 운동 목표 업데이트 요청
export interface UpdateGoalRequest {
  goalId: number
  title?: string
  description?: string
  targetValue?: number
  currentValue?: number
  deadline?: Date
  isCompleted?: boolean
}

// 운동 계획 생성 요청
export interface CreatePlanRequest {
  userId: number
  name: string
  description?: string
  exercises: Array<{
    machineId: number
    exerciseName: string
    order: number
    sets: number
    reps: number
    weight?: number
    restTime?: number
    notes?: string
  }>
}

// 운동 알림 생성 요청
export interface CreateReminderRequest {
  userId: number
  title: string
  message: string
  scheduledTime: Date
  isRepeating?: boolean
  repeatDays?: number[]
}

// 운동 통계 조회 요청
export interface GetStatsRequest {
  userId: number
  period: "day" | "week" | "month" | "year"
  startDate?: Date
  endDate?: Date
}

// 운동 진행도 조회 요청
export interface GetProgressRequest {
  userId: number
  machineId?: number
  exerciseName?: string
  startDate?: Date
  endDate?: Date
}

// API 응답 타입들
export interface SessionResponse {
  success: boolean
  message: string
  data?: WorkoutSession
  error?: string
}

export interface SessionsResponse {
  success: boolean
  message: string
  data?: WorkoutSession[]
  error?: string
}

export interface SetResponse {
  success: boolean
  message: string
  data?: ExerciseSet
  error?: string
}

export interface SetsResponse {
  success: boolean
  message: string
  data?: ExerciseSet[]
  error?: string
}

export interface GoalResponse {
  success: boolean
  message: string
  data?: WorkoutGoal
  error?: string
}

export interface GoalsResponse {
  success: boolean
  message: string
  data?: WorkoutGoal[]
  error?: string
}

export interface PlanResponse {
  success: boolean
  message: string
  data?: WorkoutPlan
  error?: string
}

export interface PlansResponse {
  success: boolean
  message: string
  data?: WorkoutPlan[]
  error?: string
}

export interface StatsResponse {
  success: boolean
  message: string
  data?: WorkoutStats
  error?: string
}

export interface ProgressResponse {
  success: boolean
  message: string
  data?: WorkoutProgress[]
  error?: string
}

export interface ReminderResponse {
  success: boolean
  message: string
  data?: WorkoutReminder
  error?: string
}

export interface RemindersResponse {
  success: boolean
  message: string
  data?: WorkoutReminder[]
  error?: string
}

export interface SummaryResponse {
  success: boolean
  message: string
  data?: WorkoutSummary
  error?: string
}
