// ============================================================================
// Workout Feature Types - Core Data Types
// ============================================================================

// 공통 타입들을 import
export type {
  WorkoutPlan,
  WorkoutPlanExercise,
  WorkoutSession,
  ExerciseSet,
  WorkoutGoal,
  Machine,
  Gym,
  DashboardData,
  CreatePlanRequest,
  UpdatePlanRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateGoalRequest,
  UpdateGoalRequest,
  CreateExerciseSetRequest,
  UpdateExerciseSetRequest,
  PaginationParams,
  PaginatedResponse,
} from "../../../../shared/types/common"

// ============================================================================
// Dashboard & Analytics Types
// ============================================================================

// DashboardData는 공통 타입에서 import됨

export interface WorkoutStats {
  totalSessions: number
  totalDurationMinutes: number
  totalCaloriesBurned: number
  longestStreak: number
  currentStreak: number
  favoriteMachines: string[]
  favoriteExercises: string[]
  startDate: Date
  lastWorkoutDate?: Date
  dailyStats: DailyStats[]
  weeklyStats: WeeklyStats[]
  monthlyStats: MonthlyStats[]
}

export interface DailyStats {
  date: Date
  sessions: number
  duration: number
  calories: number
  exercises: number
}

export interface WeeklyStats {
  week: string
  sessions: number
  duration: number
  calories: number
  streak: number
}

export interface MonthlyStats {
  month: string
  sessions: number
  duration: number
  calories: number
  goals: number
}

// ============================================================================
// UI State Types
// ============================================================================

export type TabType =
  | "overview"
  | "goals"
  | "plans"
  | "sessions"
  | "workoutProgress"

export interface LoadingState {
  isLoading: boolean
  error: string | null
  lastUpdated?: Date
}

export interface ModalState {
  isOpen: boolean
  mode: "create" | "edit" | "view"
  data?: any
  formData?: any
}

export interface WorkoutPlanModalState extends ModalState {
  data?: WorkoutPlan
  formData?: Partial<WorkoutPlan>
}

export interface WorkoutSessionModalState extends ModalState {
  data?: WorkoutSession
  formData?: Partial<WorkoutSession>
  currentExerciseIndex?: number
  timerState?: {
    isRunning: boolean
    elapsedTime: number
    totalTime: number
  }
}

export interface WorkoutGoalModalState extends ModalState {
  data?: WorkoutGoal
  formData?: Partial<WorkoutGoal>
  progressData?: {
    currentValue: number
    targetValue: number
    percentage: number
  }
}

// ============================================================================
// Tab State Types
// ============================================================================

export interface OverviewTabState {
  selectedTimeRange: string
  selectedMetric: string
}

export interface PlansTabState {
  selectedDifficulty: string
  selectedStatus: string
  searchQuery: string
}

export interface SessionsTabState {
  selectedStatus: string
  selectedDateRange: string
  searchQuery: string
}

export interface GoalsTabState {
  selectedType: string
  selectedStatus: string
  searchQuery: string
  showCompleted: boolean
  sortBy: "progress" | "deadline" | "title" | "createdAt"
  selectedGoalId?: number
}

export interface ProgressTabState {
  selectedTimeRange: string
  selectedMetric: string
  chartType: string
  compareMode: boolean
}

// ============================================================================
// Chart Data Types
// ============================================================================

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

// ============================================================================
// Notification & Error Types
// ============================================================================

export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  timestamp: Date
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface FormErrors {
  [key: string]: string[]
}

// ============================================================================
// Utility Types
// ============================================================================

export type Difficulty = "beginner" | "intermediate" | "advanced"
export type GoalType = "weight" | "reps" | "duration" | "frequency" | "streak"
export type SessionStatus = "in_progress" | "completed" | "paused" | "cancelled"
export type PlanStatus = "active" | "archived" | "draft"
export type ViewMode = "grid" | "list" | "calendar" | "progress"
export type ChartType = "line" | "bar" | "pie" | "area" | "radar"
export type TimeRange = "day" | "week" | "month" | "quarter" | "year"
