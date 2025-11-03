// ============================================================================
// Workout Feature Types Export
// ============================================================================

export * from "./workout"

// 공통 타입들을 import하고 다시 export
import type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  LoadingState,
  User,
  Machine,
  Gym,
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  WorkoutPlanExercise,
  ExerciseSet,
  DashboardData,
  CreatePlanRequest,
  UpdatePlanRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateGoalRequest,
  UpdateGoalRequest,
  CreateExerciseSetRequest,
  UpdateExerciseSetRequest,
} from "../../../../shared/types/common"

// DTO 타입들을 import
import type {
  // Machine DTOs
  MachineDTO,
  MachineCategoryDTO,
  DifficultyLevelDTO,
  CreateMachineDTO,
  UpdateMachineDTO,
  MachineDTOResponse,
  MachineDTOListResponse,

  // User DTOs
  UserDTO,
  CreateUserDTO,
  UpdateUserDTO,
  UserDTOResponse,
  UserDTOListResponse,

  // WorkoutPlan DTOs
  WorkoutPlanDTO,
  CreateWorkoutPlanDTO,
  UpdateWorkoutPlanDTO,
  WorkoutPlanDTOResponse,
  WorkoutPlanDTOListResponse,

  // WorkoutSession DTOs
  WorkoutSessionDTO,
  CreateWorkoutSessionDTO,
  UpdateWorkoutSessionDTO,
  WorkoutSessionDTOResponse,
  WorkoutSessionDTOListResponse,

  // WorkoutGoal DTOs
  WorkoutGoalDTO,
  CreateWorkoutGoalDTO,
  UpdateWorkoutGoalDTO,
  WorkoutGoalDTOResponse,
  WorkoutGoalDTOListResponse,

  // ExerciseSet DTOs
  ExerciseSetDTO,
  CreateExerciseSetDTO,
  UpdateExerciseSetDTO,
  ExerciseSetDTOResponse,
  ExerciseSetDTOListResponse,

  // UserLevel DTOs
  UserLevelDTO,

  // UserStreak DTOs
  UserStreakDTO,
} from "../../../../shared/types/dto"

export type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  LoadingState as WorkoutLoadingState, // 컴포넌트 이름과 충돌 방지
  User,
  Machine,
  Gym,
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  WorkoutPlanExercise,
  ExerciseSet,
  DashboardData,
  CreatePlanRequest,
  UpdatePlanRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateGoalRequest,
  UpdateGoalRequest,
  CreateExerciseSetRequest,
  UpdateExerciseSetRequest,
}

// DTO 타입들을 export
export type {
  // Machine DTOs
  MachineDTO,
  MachineCategoryDTO,
  DifficultyLevelDTO,
  CreateMachineDTO,
  UpdateMachineDTO,
  MachineDTOResponse,
  MachineDTOListResponse,

  // User DTOs
  UserDTO,
  CreateUserDTO,
  UpdateUserDTO,
  UserDTOResponse,
  UserDTOListResponse,

  // WorkoutPlan DTOs
  WorkoutPlanDTO,
  CreateWorkoutPlanDTO,
  UpdateWorkoutPlanDTO,
  WorkoutPlanDTOResponse,
  WorkoutPlanDTOListResponse,

  // WorkoutSession DTOs
  WorkoutSessionDTO,
  CreateWorkoutSessionDTO,
  UpdateWorkoutSessionDTO,
  WorkoutSessionDTOResponse,
  WorkoutSessionDTOListResponse,

  // WorkoutGoal DTOs
  WorkoutGoalDTO,
  CreateWorkoutGoalDTO,
  UpdateWorkoutGoalDTO,
  WorkoutGoalDTOResponse,
  WorkoutGoalDTOListResponse,

  // ExerciseSet DTOs
  ExerciseSetDTO,
  CreateExerciseSetDTO,
  UpdateExerciseSetDTO,
  ExerciseSetDTOResponse,
  ExerciseSetDTOListResponse,

  // UserLevel DTOs
  UserLevelDTO,

  // UserStreak DTOs
  UserStreakDTO,
}

// ============================================================================
// 프론트엔드 전용 타입들 (UI/UX 관련)
// ============================================================================

// 운동 계획 관련 UI 타입
export interface WorkoutPlanCardProps {
  plan: WorkoutPlanDTO
  onEdit?: (plan: WorkoutPlanDTO) => void
  onDelete?: (planId: number) => void
  onStart?: (plan: WorkoutPlanDTO) => void
}

// 운동 세션 관련 UI 타입
export interface WorkoutSessionCardProps {
  session: WorkoutSessionDTO
  isActive?: boolean
  onView?: (session: WorkoutSessionDTO) => void
  onEdit?: (session: WorkoutSessionDTO) => void
  onDelete?: (sessionId: number) => void
  onStart?: (session: WorkoutSessionDTO) => void
  onPause?: (session: WorkoutSessionDTO) => void
  onComplete?: (session: WorkoutSessionDTO) => void
  onResume?: (session: WorkoutSessionDTO) => void
  onClick?: (session: WorkoutSessionDTO) => void
  compact?: boolean
}

// 운동 목표 관련 UI 타입
export interface WorkoutGoalCardProps {
  goal: WorkoutGoalDTO
  onEdit?: (goal: WorkoutGoalDTO) => void
  onDelete?: (goalId: number) => void
  onUpdateProgress?: (goalId: number, progress: number) => void
}

// 목표 진행률 바 타입
export interface GoalProgressBarProps {
  goal: WorkoutGoalDTO
  onEdit?: (goal: WorkoutGoalDTO) => void
  onDelete?: (goalId: number) => void
  onClick?: () => void
  onSelect?: () => void
  compact?: boolean
  isSelected?: boolean
  className?: string
}

// 차트 데이터 타입
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface TimeRangeData {
  label: string
  value: number
  change?: number
  trend?: "up" | "down" | "stable"
}

// 필터 및 정렬 타입
export interface FilterOptions {
  difficulty?: string
  status?: string
  type?: string
  dateRange?: string
  searchQuery?: string
}

export interface SortOptions {
  field: string
  direction: "asc" | "desc"
}

// 탭 네비게이션 타입
export interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  tabs: Array<{
    key: TabType
    label: string
    icon?: string
    enabled?: boolean
  }>
  className?: string
}

// TabType 정의
export type TabType =
  | "overview"
  | "goals"
  | "plans"
  | "sessions"
  | "workoutProgress"

// 운동 리마인더 타입
export interface WorkoutReminderDTO {
  id: number
  userId: number
  title: string
  description?: string
  scheduledTime: Date
  isActive: boolean
  repeatDays?: number[]
  createdAt: Date
  updatedAt: Date
}

// 운동 아이템 타입
export interface ExerciseItem {
  id: number
  name: string
  machineId?: number
  sets: number
  reps: number
  weight?: number
  restTime: number
  order: number
  isCompleted?: boolean
}

// 폼 운동 타입
export interface FormExercise {
  exerciseOrder: number
  machineId: number
  sets: number
  reps: number
  weight: number
  restTime: number
  repsRange?: { min: number; max: number }
  weightRange?: { min: number; max: number }
  restSeconds?: number
}

// 세션 데이터 타입
export interface SessionData {
  sessionId: number
  planId: number
  startTime: Date
  name?: string
  plan?: any
  exercises?: any[]
  exerciseSets?: any[]
  notes?: string
}

// 타이머 상태 타입
export interface TimerState {
  isRunning: boolean
  seconds: number
  totalSeconds: number
}

// 운동 통계 타입
export interface WorkoutStatsDTO {
  totalWorkouts: number
  totalSessions: number
  totalGoals: number
  completedGoals: number
  totalDuration: number
  totalCalories: number
  averageWorkoutDuration: number
  workoutStreak: number
  favoriteExercises: Array<{
    name: string
    count: number
  }>
  monthlyProgress: Array<{
    month: string
    workouts: number
    duration: number
  }>
}
