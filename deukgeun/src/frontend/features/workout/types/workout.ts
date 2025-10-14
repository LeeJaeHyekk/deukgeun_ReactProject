// ============================================================================
// Workout Feature Types - Core Data Types
// ============================================================================

// 공통 타입들을 import
import type {
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
  ApiResponse,
} from "../../../../shared/types/common"

// 타입들을 다시 export
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
  ApiResponse,
}

// ============================================================================
// Dashboard & Analytics Types
// ============================================================================

// DashboardData는 공통 타입에서 import됨

export interface WorkoutStats {
  totalSessions: number
  totalWorkouts?: number // 호환성을 위한 별칭
  totalExercises?: number // 호환성을 위한 별칭
  totalDuration: number
  totalDurationMinutes?: number // 호환성을 위한 별칭
  totalCaloriesBurned?: number // 호환성을 위한 별칭
  totalCalories?: number // WorkoutStatsDTO 호환성
  averageDuration?: number // 호환성을 위한 별칭
  averageWorkoutDuration?: number // WorkoutStatsDTO 호환성
  completionRate?: number // 호환성을 위한 별칭
  weeklyProgress?: any[] // 호환성을 위한 별칭
  monthlyProgress?: any[] // 호환성을 위한 별칭
  longestStreak?: number // 호환성을 위한 별칭
  currentStreak: number
  workoutStreak?: number // WorkoutStatsDTO 호환성
  favoriteMachines?: string[] // 호환성을 위한 별칭
  favoriteExercises?: Array<{ name: string; count: number }> // WorkoutStatsDTO 호환성
  startDate?: Date // 호환성을 위한 별칭
  lastWorkoutDate?: Date
  dailyStats?: DailyStats[] // 호환성을 위한 별칭
  weeklyStats?: WeeklyStats[] // 호환성을 위한 별칭
  monthlyStats?: MonthlyStats[] // 호환성을 위한 별칭
  averageMood: number
  averageEnergy: number
  completedGoals: number
  activeGoals: number
  totalGoals?: number // WorkoutStatsDTO 호환성
  totalExp: number
  level: number
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
  mode: "create" | "edit" | "view" | "duplicate" | "active"
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
  filterStatus: "all" | "active" | "archived" | "draft"
  sortBy: "createdAt" | "name" | "difficulty" | "date_desc"
  viewMode: "grid" | "list"
  selectedPlanId: number | null
}

export interface SessionsTabState {
  selectedStatus: string
  selectedDateRange: string
  searchQuery: string
  filterStatus: "all" | "completed" | "in_progress" | "paused" | "cancelled"
  sortBy: "startTime" | "name" | "duration" | "status"
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
// Service Types
// ============================================================================

export interface GoalSectionConfig {
  goalType: string
  intensity: string
  duration: number
  muscleGroups: string[]
  muscleGroup?: string // 단일 그룹도 지원
  targetValue: number
  currentValue: number
  exercises: string[]
}

export interface AutoGeneratedSection {
  id: string
  name: string
  exerciseName?: string
  exercises: WorkoutPlanExercise[]
  sets?: number
  reps?: number
  weight?: number
  restTime?: number
  isCompleted?: boolean
  progress?: number
  goalId?: number
  machineId?: number
  order?: number
  estimatedDuration: number
  difficulty: string
}

export interface SectionGenerationParams {
  goalType: string
  intensity: string
  duration: number
  muscleGroups: string[]
  userLevel: string
}

export interface ChartData {
  date?: string
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }>
}


export interface WorkoutSessionStatus {
  isActive: boolean
  isPaused: boolean
  isCompleted: boolean
  elapsedTime: number
  totalTime: number
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
// Timer State Types
// ============================================================================

export interface TimerState {
  isRunning: boolean
  isPaused: boolean
  elapsedTime: number
  totalTime: number
  seconds: number
  totalSeconds: number
  startTime?: Date
  pauseTime?: Date
  sessionId?: number
}

export interface SectionTimerState {
  isRunning: boolean
  isPaused: boolean
  elapsedTime: number
  totalTime: number
  currentSection: number
  sections: Array<{
    id: string
    name: string
    duration: number
    isCompleted: boolean
  }>
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
