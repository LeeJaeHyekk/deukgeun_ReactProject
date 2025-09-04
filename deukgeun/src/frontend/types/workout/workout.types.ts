// 프론트엔드 전용 Workout 타입 정의

// 기본 운동 계획 운동 타입
export interface WorkoutPlanExercise {
  id: number
  planId: number
  exerciseId: number
  machine: Machine
  weight: number
  reps: number
  order: number
  notes?: string
  // 기존 컴포넌트와의 호환성을 위한 속성들
  exerciseName?: string
  exerciseOrder?: number
  repsRange?: string
  weightRange?: string
  restSeconds?: number
  // 추가 호환성 속성들
  sets?: number
  machineId?: number
  restTime?: number
}

// 운동 계획 타입
export interface WorkoutPlan {
  id: number
  userId: number
  title: string
  description?: string
  type: "strength" | "cardio" | "flexibility" | "mixed"
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDuration: number
  isActive: boolean
  exercises: WorkoutPlanExercise[]
  createdAt: Date
  updatedAt: Date
}

// 운동 세션 타입
export interface WorkoutSession {
  id: number
  userId: number
  planId?: number
  gymId?: number
  name: string // 추가: 세션 이름
  description?: string // 추가: 세션 설명
  startTime: Date
  endTime?: Date
  duration?: number
  totalDurationMinutes?: number // 추가: 총 운동 시간
  notes?: string
  status: "planned" | "in_progress" | "completed" | "cancelled" | "paused" // paused 상태 추가
  exerciseSets: ExerciseSet[]
  plan?: WorkoutPlan
  isCompleted: boolean // 추가: 완료 여부
  createdAt: Date
  updatedAt: Date
}

// 운동 세트 타입
export interface ExerciseSet {
  id: number
  sessionId: number
  exerciseId: number
  machine: Machine
  machineId: number // 추가: 기계 ID
  setNumber: number // 추가: 세트 번호
  weight: number
  reps: number
  order: number
  notes?: string
  completedAt?: Date
  restSeconds: number // 추가: 휴식 시간
}

// 운동 목표 타입
export interface WorkoutGoal {
  id: number
  userId: number
  title: string
  description?: string
  type: string // 추가: 목표 타입
  targetValue: number
  currentValue: number
  unit: string
  deadline: Date
  isCompleted: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// 기계 타입
export interface Machine {
  id: number
  machineKey: string
  name: string
  imageUrl: string
  category: MachineCategory
  difficulty: DifficultyLevel
  description?: string
  instructions?: string
  muscleGroups: string[]
  targetMuscleGroups: string[] // 추가: 타겟 근육 그룹
  gymId: number // 추가: 헬스장 ID
  createdAt: Date
  updatedAt: Date
}

// 기계 카테고리
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
export type DifficultyLevel = "beginner" | "intermediate" | "advanced"

// 페이지네이션 타입
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext?: boolean // 추가: 다음 페이지 존재 여부
  hasPrev?: boolean // 추가: 이전 페이지 존재 여부
}

// 페이지네이션된 응답 타입
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

// API 요청/응답 타입
export interface CreatePlanRequest {
  title: string
  description?: string
  type: "strength" | "cardio" | "flexibility" | "mixed"
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDuration: number
  exercises: Omit<WorkoutPlanExercise, "id" | "planId">[]
}

export interface UpdatePlanRequest {
  id: number
  title?: string
  description?: string
  type?: "strength" | "cardio" | "flexibility" | "mixed"
  difficulty?: "beginner" | "intermediate" | "advanced"
  estimatedDuration?: number
  isActive?: boolean
  exercises?: Omit<WorkoutPlanExercise, "id" | "planId">[]
}

export interface CreateSessionRequest {
  planId?: number
  gymId?: number
  name?: string // 추가: 세션 이름
  description?: string // 추가: 세션 설명
  startTime: Date
  notes?: string
}

export interface UpdateSessionRequest {
  id: number
  name?: string // 추가: 세션 이름
  description?: string // 추가: 세션 설명
  endTime?: Date
  duration?: number
  totalDurationMinutes?: number // 추가: 총 운동 시간
  notes?: string
  status?: "planned" | "in_progress" | "completed" | "cancelled" | "paused"
  isCompleted?: boolean // 추가: 완료 여부
  exerciseSets?: any[] // 추가: 운동 세트
}

export interface CreateGoalRequest {
  title: string
  description?: string
  type: string // 추가: 목표 타입
  targetValue: number
  unit: string
  deadline: Date
}

export interface UpdateGoalRequest {
  id: number
  title?: string
  description?: string
  type?: string // 추가: 목표 타입
  targetValue?: number
  currentValue?: number
  unit?: string
  deadline?: Date
  isCompleted?: boolean // 추가: 완료 여부
  completedAt?: Date // 추가: 완료 시간
}

// DTO 타입 (백엔드와의 호환성을 위해)
export type WorkoutPlanDTO = WorkoutPlan
export type WorkoutSessionDTO = WorkoutSession
export type WorkoutGoalDTO = WorkoutGoal
export type MachineDTO = Machine

// API 응답 래퍼 타입
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiListResponse<T> {
  data: T[]
  pagination: PaginationInfo
  message?: string
  success: boolean
}

// 추가: API 요청 파라미터 타입
export interface ApiRequestParams {
  [key: string]: string | number | boolean
}

// 추가: 운동 세션 상태 타입
export type WorkoutSessionStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "paused"

// 추가: 운동 목표 타입 상세
export type WorkoutGoalType =
  | "weight_loss"
  | "muscle_gain"
  | "endurance"
  | "strength"
  | "flexibility"
  | "custom"

// 추가: 운동 계획 난이도 타입
export type WorkoutDifficulty = "beginner" | "intermediate" | "advanced"

// 추가: 운동 계획 타입 상세
export type WorkoutPlanType = "strength" | "cardio" | "flexibility" | "mixed"
