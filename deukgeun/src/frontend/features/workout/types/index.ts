// ============================================================================
// Workout Feature Types Export - 중복 제거 및 프론트엔드 전용 타입 사용
// ============================================================================

export * from "./workout"

// Workout 타입들을 명시적으로 import
import type { WorkoutPlan, WorkoutSession, WorkoutGoal } from "./workout"

// 프론트엔드 전용 타입들
import type {
  ComponentProps,
  FormState,
  NavigationItem,
  Notification,
  ModalState,
  ChartData,
  ProgressData,
  SearchFilters,
  PaginationState,
  RequestState,
  AppError,
  PerformanceMetrics,
  AccessibilityProps,
  ResponsiveValue,
} from "../../../types/frontend.types"

// 공통 타입들은 필요한 경우에만 선택적으로 import
// 중복을 방지하기 위해 shared 타입은 직접 import하지 않음

// 프론트엔드 전용 타입들을 export
export type {
  ComponentProps,
  FormState,
  NavigationItem,
  Notification,
  ModalState,
  ChartData,
  ProgressData,
  SearchFilters,
  PaginationState,
  RequestState,
  AppError,
  PerformanceMetrics,
  AccessibilityProps,
  ResponsiveValue,
}

// ============================================================================
// 프론트엔드 전용 타입들 (UI/UX 관련)
// ============================================================================

// 운동 계획 관련 UI 타입
export interface WorkoutPlanCardProps {
  plan: WorkoutPlan
  onEdit?: (plan: WorkoutPlan) => void
  onDelete?: (planId: number) => void
  onStart?: (plan: WorkoutPlan) => void
}

// 운동 세션 관련 UI 타입
export interface WorkoutSessionCardProps {
  session: WorkoutSession
  isActive?: boolean
  onView?: (session: WorkoutSession) => void
  onEdit?: (session: WorkoutSession) => void
  onDelete?: (sessionId: number) => void
  onStart?: (session: WorkoutSession) => void
  onPause?: (session: WorkoutSession) => void
  onComplete?: (session: WorkoutSession) => void
  onResume?: (session: WorkoutSession) => void
  onClick?: (session: WorkoutSession) => void
  compact?: boolean
}

// 운동 목표 관련 UI 타입
export interface WorkoutGoalCardProps {
  goal: WorkoutGoal
  onEdit?: (goal: WorkoutGoal) => void
  onDelete?: (goalId: number) => void
  onUpdateProgress?: (goalId: number, progress: number) => void
}

// 목표 진행률 바 타입
export interface GoalProgressBarProps {
  goal: WorkoutGoal
  onEdit?: (goal: WorkoutGoal) => void
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
export interface WorkoutReminder {
  id: number
  userId: number
  title: string
  description?: string
  scheduledTime: Date
  time?: string // 시간 (HH:MM 형식)
  days?: string[] // 반복 요일
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
export interface WorkoutStats {
  totalWorkouts: number
  totalSessions: number
  totalGoals: number
  completedGoals: number
  totalDuration: number
  totalDurationMinutes?: number // 총 운동 시간 (분) - 별칭
  totalCalories: number
  totalCaloriesBurned?: number // 총 소모 칼로리 (별칭)
  averageWorkoutDuration: number
  workoutStreak: number
  currentStreak?: number // 현재 연속 운동 일수
  longestStreak?: number // 최장 연속 운동 일수
  startDate?: Date // 운동 시작일
  lastWorkoutDate?: Date // 마지막 운동일
  favoriteExercises: Array<{
    name: string
    count: number
  }>
  favoriteMachines?: Array<{
    name: string
    count: number
  }> // 선호하는 머신
  monthlyProgress: Array<{
    month: string
    workouts: number
    duration: number
  }>
  weeklyProgress?: Array<{
    week: string
    workouts: number
    duration: number
  }> // 주간 진행률
  averageMood: number
  averageEnergy: number
  activeGoals: number
  totalExp: number
  level: number
}
