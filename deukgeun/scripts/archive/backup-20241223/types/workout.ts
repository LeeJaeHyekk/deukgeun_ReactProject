// ============================================================================
// 워크아웃 관련 타입 - Backend Database Schema Aligned
// ============================================================================

// Base entity interface
export interface BaseEntity {
  id: number
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// Core Workout Entities
// ============================================================================

// Workout Plan - matches WorkoutPlan entity
export interface WorkoutPlan extends BaseEntity {
  userId: number
  name: string
  description?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDurationMinutes: number
  targetMuscleGroups?: string[]
  isTemplate: boolean
  isPublic: boolean
  exercises: WorkoutPlanExercise[]
  user?: User
}

// Workout Plan Exercise - matches WorkoutPlanExercise entity
export interface WorkoutPlanExercise extends BaseEntity {
  planId: number
  machineId?: number
  exerciseName: string
  exerciseOrder: number
  sets: number
  repsRange: { min: number; max: number }
  weightRange?: { min: number; max: number }
  restSeconds: number
  notes?: string
  workoutPlan?: WorkoutPlan
  machine?: Machine
}

// Workout Session - matches WorkoutSession entity
export interface WorkoutSession extends BaseEntity {
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
  workoutPlan?: WorkoutPlan
  gym?: Gym
  user?: User
}

// Exercise Set - matches ExerciseSet entity
export interface ExerciseSet extends BaseEntity {
  sessionId: number
  machineId: number
  setNumber: number
  repsCompleted: number
  weightKg?: number
  durationSeconds?: number
  distanceMeters?: number
  rpeRating?: number
  notes?: string
  workoutSession?: WorkoutSession
  machine?: Machine
}

// Workout Goal - matches WorkoutGoal entity
export interface WorkoutGoal extends BaseEntity {
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
  user?: User
}

// Machine - matches Machine entity
export interface Machine extends BaseEntity {
  name: string
  category: string
  difficulty: string
  description?: string
  instructions?: string
  imageUrl?: string
  muscleGroups?: string[]
  exercises?: WorkoutPlanExercise[]
  exerciseSets?: ExerciseSet[]
}

// Gym - matches Gym entity
export interface Gym extends BaseEntity {
  name: string
  address?: string
  phone?: string
  sessions?: WorkoutSession[]
}

// User - matches User entity
export interface User extends BaseEntity {
  email: string
  nickname: string
  name?: string
  phone?: string
  gender?: "male" | "female" | "other"
  birthday?: Date
  profileImage?: string
  plans?: WorkoutPlan[]
  sessions?: WorkoutSession[]
  goals?: WorkoutGoal[]
}

// ============================================================================
// API Request/Response Types
// ============================================================================

// Create Plan Request
export interface CreatePlanRequest {
  name: string
  description?: string
  difficulty?: "beginner" | "intermediate" | "advanced"
  estimatedDurationMinutes: number
  targetMuscleGroups?: string[]
  isTemplate?: boolean
  isPublic?: boolean
  exercises: {
    machineId?: number
    exerciseName: string
    exerciseOrder: number
    sets: number
    repsRange: { min: number; max: number }
    weightRange?: { min: number; max: number }
    restSeconds?: number
    notes?: string
  }[]
}

// Update Plan Request
export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {
  id: number
}

// Create Session Request
export interface CreateSessionRequest {
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
  status?: "in_progress" | "completed" | "paused" | "cancelled"
  exerciseSets: {
    machineId: number
    setNumber: number
    repsCompleted: number
    weightKg?: number
    durationSeconds?: number
    distanceMeters?: number
    rpeRating?: number
    notes?: string
  }[]
}

// Update Session Request
export interface UpdateSessionRequest extends Partial<CreateSessionRequest> {
  id: number
}

// Create Goal Request
export interface CreateGoalRequest {
  userId: number
  title: string
  description?: string
  type: "weight" | "reps" | "duration" | "frequency" | "streak"
  targetValue: number
  currentValue?: number
  unit: string
  deadline?: Date
  isCompleted?: boolean
}

// Update Goal Request
export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {
  goalId: number
}

// Create Exercise Set Request
export interface CreateExerciseSetRequest {
  sessionId: number
  machineId: number
  setNumber: number
  repsCompleted: number
  weightKg?: number
  durationSeconds?: number
  distanceMeters?: number
  rpeRating?: number
  notes?: string
}

// Update Exercise Set Request
export interface UpdateExerciseSetRequest extends Partial<CreateExerciseSetRequest> {
  id: number
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================================================
// UI Component Props
// ============================================================================

// Session Card Props
export interface SessionCardProps {
  session: WorkoutSession
  onEdit?: (session: WorkoutSession) => void
  onDelete?: (sessionId: number) => void
  onView?: (session: WorkoutSession) => void
  onStart?: (session: WorkoutSession) => void
  onPause?: (session: WorkoutSession) => void
  onClick?: (session: WorkoutSession) => void
  className?: string
  isActive?: boolean
  isCompleted?: boolean
  compact?: boolean
  onComplete?: (exerciseIndex: number) => void
  onStartRest?: (seconds: number) => void
  onStopRest?: () => void
  restTimer?: number
  isRestTimerRunning?: boolean
}

// Workout Plan Card Props
export interface WorkoutPlanCardProps {
  plan: WorkoutPlan
  onEdit?: (plan: WorkoutPlan) => void
  onDelete?: (planId: number) => void
  onView?: (plan: WorkoutPlan) => void
  onStartSession?: (plan: WorkoutPlan) => void
  onClick?: (plan: WorkoutPlan) => void
  className?: string
  compact?: boolean
}

// ============================================================================
// Timer & Session Management
// ============================================================================

// Timer State
export interface TimerState {
  isRunning: boolean
  isPaused?: boolean
  elapsedTime: number
  totalTime: number
  currentSection: number
  sections: Array<{
    id: number
    name: string
    duration: number
    isCompleted: boolean
  }>
}

// Session Data
export interface SessionData {
  sessionId?: number
  userId: number
  planId?: number
  name: string
  startTime: Date
  endTime?: Date
  status: "in_progress" | "completed" | "paused" | "cancelled"
  exercises?: any[]
  notes?: string
}

// ============================================================================
// Workout Statistics & Analytics
// ============================================================================

// Workout Statistics
export interface WorkoutStats {
  totalWorkouts: number
  totalSessions?: number
  totalDuration: number
  totalExercises?: number
  averageDuration: number
  completionRate?: number
  favoriteExercises: string[]
  weeklyProgress: number[]
  monthlyProgress: number[]
}

// Session Summary
export interface SessionSummary {
  totalSets: number
  totalReps: number
  totalWeight: number
  averageProgress: number
  completedSections: number
  totalSections: number
}

// ============================================================================
// Auto-Generated Workout Types
// ============================================================================

// Auto-Generated Section
export interface AutoGeneratedSection {
  id: number
  name: string
  exerciseName?: string
  type: "warmup" | "exercise" | "rest" | "cooldown"
  duration: number
  exercises?: WorkoutPlanExercise[]
  instructions?: string
  sets?: number
  reps?: number
  weight?: number
  restTime?: number
  isCompleted?: boolean
  progress?: number
}

// Goal Section Configuration
export interface GoalSectionConfig {
  goalType: "weight" | "reps" | "duration" | "frequency"
  targetValue: number
  currentValue: number
  muscleGroup?: string
  exerciseName?: string
}

// ============================================================================
// UI State Types
// ============================================================================

// Tab Types
export type TabType = "overview" | "plans" | "sessions" | "goals" | "progress"

// Modal State
export interface ModalState {
  isOpen: boolean
  mode: "create" | "edit" | "view"
  data?: any
}

// Workout Plan Modal State
export interface WorkoutPlanModalState {
  isOpen: boolean
  mode: "create" | "edit" | "view"
  plan?: WorkoutPlan
  exercises: WorkoutPlanExercise[]
  confirmedExerciseIndices: Set<number>
}

// Workout Session Modal State
export interface WorkoutSessionModalState {
  isOpen: boolean
  mode: "create" | "edit" | "view"
  session?: WorkoutSession
  plan?: WorkoutPlan
  currentExerciseIndex: number
  currentSetIndex: number
  isTimerRunning: boolean
  restTimer: number
}

// Workout Goal Modal State
export interface WorkoutGoalModalState {
  isOpen: boolean
  mode: "create" | "edit" | "view"
  goal?: WorkoutGoal
}

// Loading States
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

// Tab Navigation Props
export interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  tabs: TabConfig[]
  className?: string
}

export interface TabConfig {
  key: TabType
  label: string
  icon?: string
  badge?: number
  disabled?: boolean
}

// Modal Footer Props
export interface ModalFooterProps {
  onSave: () => Promise<void>
  onClose: () => void
  isViewMode?: boolean
}

// ============================================================================
// Service Types
// ============================================================================

// Goal Type
export type GoalType = "weight" | "reps" | "duration" | "frequency" | "streak"

// Section Generation Params
export interface SectionGenerationParams {
  goalType: GoalType
  intensity: string
  duration: number
  targetMuscles: string[]
}

// Section Timer State
export interface SectionTimerState {
  isActive: boolean
  isRunning: boolean
  currentSection: AutoGeneratedSection | null
  timeRemaining: number
  totalTime: number
  elapsedTime: number
  isPaused: boolean
}

// Chart Data
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
  }[]
  date?: string
}

// Session Status
export type SessionStatus = "in_progress" | "completed" | "paused" | "cancelled"

// ============================================================================
// Utility Types
// ============================================================================

// Goal Progress Bar Props
export interface GoalProgressBarProps {
  goal: WorkoutGoal
  currentValue?: number
  maxValue?: number
  showPercentage?: boolean
  className?: string
  compact?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onClick?: () => void
}

// Dashboard Types
export interface DashboardStats {
  totalPlans: number
  totalSessions: number
  completedSessions: number
  activeGoals: number
  weeklyWorkouts: number
  totalDuration: number
  averageMood: number
  averageEnergy: number
}

export interface WeeklyProgress {
  date: string
  sessions: number
  duration: number
  mood: number
  energy: number
}

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
  recentProgress: any[]
  activeGoals: WorkoutGoal[]
}
