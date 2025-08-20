// ============================================================================
// 워크아웃 관련 타입
// ============================================================================

// 운동 세션
export interface WorkoutSession {
  id: number
  userId: number
  name: string
  session_name?: string // 백엔드 호환성
  description?: string
  startTime: Date
  start_time?: Date // 백엔드 호환성
  endTime?: Date
  end_time?: Date // 백엔드 호환성
  duration?: number // 분 단위
  caloriesBurned?: number
  calories_burned?: number // 백엔드 호환성
  notes?: string
  isCompleted: boolean
  status?: string // 백엔드 호환성
  exerciseSets?: ExerciseSet[] // 세트 정보
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
  goal_id?: number // 프론트엔드 호환성
  created_at?: Date // 프론트엔드 호환성
  createdAt: Date
  updatedAt: Date
}

// 운동 계획
export interface WorkoutPlan {
  id: number
  userId: number
  name: string
  plan_name?: string // 프론트엔드 호환성
  plan_id?: number // 프론트엔드 호환성
  description?: string
  difficulty?: string // 프론트엔드 호환성
  estimated_duration_minutes?: number // 프론트엔드 호환성
  target_muscle_groups?: string[] // 프론트엔드 호환성
  isActive: boolean
  is_template?: boolean // 프론트엔드 호환성
  created_at?: Date // 프론트엔드 호환성
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
  name: string
  session_name?: string // 백엔드 호환성
  description?: string
  planId?: number
  plan_id?: number // 백엔드 호환성
  gymId?: number
  gym_id?: number // 백엔드 호환성
  startTime?: Date
  start_time?: Date // 백엔드 호환성
  moodRating?: number
  mood_rating?: number // 백엔드 호환성
  energyLevel?: number
  energy_level?: number // 백엔드 호환성
  notes?: string
}

// 운동 세션 업데이트 요청
export interface UpdateSessionRequest {
  sessionId: number
  name?: string
  session_name?: string // 백엔드 호환성
  description?: string
  endTime?: Date
  end_time?: Date // 백엔드 호환성
  caloriesBurned?: number
  calories_burned?: number // 백엔드 호환성
  notes?: string
  isCompleted?: boolean
  is_completed?: boolean // 백엔드 호환성
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
  name: string
  plan_name?: string // 백엔드 호환성
  description?: string
  difficulty?: string
  estimated_duration_minutes?: number
  target_muscle_groups?: string[]
  is_template?: boolean
  is_public?: boolean
  exercises: Array<{
    machineId: number
    machine_id?: number // 백엔드 호환성
    exerciseName: string
    order: number
    sets: number
    reps: number
    reps_min?: number
    reps_max?: number
    weight?: number
    weight_min?: number
    weight_max?: number
    restTime?: number
    rest_time?: number // 백엔드 호환성
    notes?: string
  }>
}

// 운동 계획 업데이트 요청
export interface UpdatePlanRequest {
  name?: string
  plan_name?: string // 백엔드 호환성
  description?: string
  difficulty?: string
  estimated_duration_minutes?: number
  target_muscle_groups?: string[]
  is_template?: boolean
  is_public?: boolean
  exercises?: Array<{
    machineId: number
    machine_id?: number // 백엔드 호환성
    exerciseName: string
    order: number
    sets: number
    reps: number
    reps_min?: number
    reps_max?: number
    weight?: number
    weight_min?: number
    weight_max?: number
    restTime?: number
    rest_time?: number // 백엔드 호환성
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
