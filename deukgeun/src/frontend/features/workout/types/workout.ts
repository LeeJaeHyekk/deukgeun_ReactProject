// ============================================================================
// Workout Feature Types - DB Schema Aligned with Frontend Compatibility
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
  status: "active" | "archived" | "draft"
  goals?: WorkoutGoal[]
  sessions?: WorkoutSession[]
}

// Workout Plan Exercise - matches WorkoutPlanExercise entity with frontend compatibility
export interface WorkoutPlanExercise extends BaseEntity {
  planId: number
  machineId?: number
  exerciseName: string
  exerciseOrder: number // DB: exerciseOrder
  order?: number // Frontend compatibility
  sets: number
  repsRange: { min: number; max: number } // DB: repsRange (JSON)
  reps?: number // Frontend compatibility (single value)
  weightRange?: { min: number; max: number } // DB: weightRange (JSON)
  weight?: number // Frontend compatibility (single value)
  restSeconds: number // DB: restSeconds
  restTime?: number // Frontend compatibility
  notes?: string
  isCompleted?: boolean
  progress?: number
}

// Workout Session - matches WorkoutSession entity with frontend compatibility
export interface WorkoutSession extends BaseEntity {
  userId: number
  planId?: number
  gymId?: number
  name: string
  startTime: Date
  endTime?: Date
  totalDurationMinutes?: number // DB: totalDurationMinutes
  duration?: number // Frontend compatibility
  moodRating?: number
  energyLevel?: number
  notes?: string
  status: "in_progress" | "completed" | "paused" | "cancelled" // DB: status enum
  isCompleted?: boolean // Frontend compatibility (derived from status)
  exerciseSets: ExerciseSet[]
  plan?: WorkoutPlan
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
}

// Workout Goal - matches WorkoutGoal entity with frontend compatibility
export interface WorkoutGoal extends BaseEntity {
  userId: number
  title: string // DB: title
  description?: string
  type: "weight" | "reps" | "duration" | "frequency" | "streak" // DB: type
  goalType?: "weight" | "reps" | "duration" | "frequency" | "streak" // Frontend compatibility
  targetValue: number
  currentValue: number
  unit: string // DB: unit
  deadline?: Date
  isCompleted: boolean
  completedAt?: Date
  planId?: number
  exerciseId?: number
}

// Machine - matches Machine entity
export interface Machine extends BaseEntity {
  name: string
  description?: string
  muscleGroup: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
  imageUrl?: string
}

// ============================================================================
// API Request & Response Types
// ============================================================================

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

// Request Payloads
export interface CreatePlanRequest {
  name: string
  description?: string
  difficulty?: string
  estimatedDurationMinutes?: number
  targetMuscleGroups?: string[]
  exercises: WorkoutPlanExercise[]
  isTemplate?: boolean
  goals?: CreateGoalRequest[]
}

export interface UpdatePlanRequest {
  name?: string
  description?: string
  difficulty?: string
  estimatedDurationMinutes?: number
  targetMuscleGroups?: string[]
  exercises?: WorkoutPlanExercise[]
  isTemplate?: boolean
  status?: "active" | "archived" | "draft"
  goals?: UpdateGoalRequest[]
}

export interface CreateSessionRequest {
  planId?: number
  name: string
  startTime: Date
  endTime?: Date
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  exerciseSets: ExerciseSet[]
}

export interface UpdateSessionRequest {
  name?: string
  startTime?: Date
  endTime?: Date
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  status?: "in_progress" | "completed" | "paused" | "cancelled"
  exerciseSets?: ExerciseSet[]
}

export interface CreateGoalRequest {
  title: string
  description?: string
  type: "weight" | "reps" | "duration" | "frequency" | "streak"
  targetValue: number
  unit: string
  deadline?: Date
  planId?: number
  exerciseId?: number
}

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
export interface UpdateExerciseSetRequest
  extends Partial<CreateExerciseSetRequest> {
  id: number
}

// ============================================================================
// Frontend Specific Types
// ============================================================================

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
  onEndRest?: () => void
}

export interface WorkoutPlanCardProps {
  plan: WorkoutPlan
  onViewPlan?: (plan: WorkoutPlan) => void
  onEditPlan?: (plan: WorkoutPlan) => void
  onDeletePlan?: (planId: number) => void
  onStartSession?: (plan: WorkoutPlan) => void
  className?: string
  compact?: boolean
}

export interface TimerState {
  isRunning: boolean
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

export interface SessionData {
  id: number
  name: string
  duration: number
  isCompleted: boolean
}

export interface WorkoutStats {
  totalWorkouts: number
  totalDuration: number
  averageDuration: number
  favoriteExercises: string[]
  weeklyProgress: number[]
  monthlyProgress: number[]
  totalSessions?: number
  totalExercises?: number
  completionRate?: number
}

export interface SessionSummary {
  totalDuration: number
  totalExercises: number
  completedSections: number
  totalSections: number
  averageSectionDuration: number
  completionRate: number
  moodRating?: number
  energyLevel?: number
  notes?: string
}

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

export interface GoalSectionConfig {
  goalType: "weight" | "reps" | "duration" | "frequency"
  targetValue: number
  currentValue: number
}

// ============================================================================
// Store & UI Types
// ============================================================================

export type TabType = "overview" | "plans" | "sessions" | "goals" | "progress"

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface ModalState {
  isOpen: boolean
  mode: "create" | "edit" | "view"
}

export interface WorkoutPlanModalState extends ModalState {
  plan?: WorkoutPlan
  exercises: WorkoutPlanExercise[]
  confirmedExerciseIndices: Set<number>
}

export interface WorkoutSessionModalState extends ModalState {
  session?: WorkoutSession
  plan?: WorkoutPlan
  currentExerciseIndex: number
  currentSetIndex: number
  isTimerRunning: boolean
  restTimer: number
}

export interface WorkoutGoalModalState extends ModalState {
  goal?: WorkoutGoal
}

// ============================================================================
// Utility Types
// ============================================================================

export type GoalType = "weight" | "reps" | "duration" | "frequency" | "streak"

export type SessionStatus = "in_progress" | "completed" | "paused" | "cancelled"

export interface ChartData {
  date: string
  duration: number
  sessions: number
  exercises: number
}

export interface DashboardData {
  stats: WorkoutStats
  recentSessions: WorkoutSession[]
  activeGoals: WorkoutGoal[]
}
