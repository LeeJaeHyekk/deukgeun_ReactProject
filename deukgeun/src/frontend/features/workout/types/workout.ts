// ============================================================================
// Workout Feature Types - 프론트엔드 전용 타입 정의
// ============================================================================

// 프론트엔드 전용 타입들을 정의
export interface WorkoutPlan {
  id: number
  userId: number
  name: string
  description?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDurationMinutes: number
  targetMuscleGroups: string[]
  isTemplate: boolean
  isPublic: boolean
  exercises: WorkoutPlanExercise[]
  status: "active" | "inactive" | "completed"
  isActive: boolean // 계획 활성화 여부
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutPlanExercise {
  id: number
  planId: number
  exerciseId: number
  machineId: number
  order: number
  sets: number
  reps: number
  weight: number
  restSeconds: number
  notes?: string
  machine: Machine
}

export interface WorkoutSession {
  id: number
  userId: number
  planId: number
  gymId: number
  name?: string // 세션 이름
  startTime: Date
  endTime?: Date
  status: "planned" | "in_progress" | "completed" | "cancelled" | "paused"
  notes?: string
  exercises: ExerciseSet[]
  plan: WorkoutPlan
  gym: Gym
  totalDuration: number // 총 운동 시간 (분)
  totalDurationMinutes?: number // 총 운동 시간 (분) - 별칭
  moodRating?: number // 기분 점수 (1-10)
  energyLevel?: number // 에너지 레벨 (1-10)
  isCompleted: boolean // 세션 완료 여부
  duration: number // 세션 지속 시간 (분)
  createdAt: Date
  updatedAt: Date
}

export interface ExerciseSet {
  id: number
  sessionId: number
  exerciseId: number
  machineId: number
  setNumber: number
  reps: number
  repsCompleted?: number // 완료된 횟수
  weight: number
  weightKg?: number // 무게 (kg) - 별칭
  restSeconds: number
  notes?: string
  machine: Machine
  rpeRating?: number // RPE 점수
}

export interface WorkoutGoal {
  id: number
  userId: number
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  deadline: Date
  status: "active" | "completed" | "cancelled"
  category: "strength" | "endurance" | "weight" | "custom"
  type: "weight" | "reps" | "duration" | "frequency" | "streak" // 목표 타입
  isCompleted: boolean
  completedAt?: Date // 목표 달성일
  createdAt: Date
  updatedAt: Date
}

export interface Machine {
  id: number
  name: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
  muscleGroups: string[]
  targetMuscleGroups?: string[] // 타겟 근육 그룹 (별칭)
  instructions?: string
  imageUrl?: string
  gymId: number
}

export interface Gym {
  id: number
  name: string
  address: string
  phone?: string
  website?: string
  hours?: string
  amenities: string[]
  machines: Machine[]
}

export interface DashboardData {
  totalWorkouts: number
  totalGoals: number
  totalDuration: number
  totalCalories: number
  currentStreak: number
  weeklyProgress: any[]
  monthlyProgress: any[]
  recentWorkouts: WorkoutSession[]
  upcomingWorkouts: WorkoutSession[]
  recentSessions: WorkoutSession[] // 최근 세션들
  goals: WorkoutGoal[]
  activeGoals: WorkoutGoal[] // 활성 목표들
}

// API 요청 타입들
export interface CreatePlanRequest {
  name: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDurationMinutes: number
  targetMuscleGroups: string[]
  isTemplate: boolean
  isPublic: boolean
  exercises: Omit<WorkoutPlanExercise, "id" | "planId">[]
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {
  id: number
}

export interface CreateSessionRequest {
  planId: number
  gymId: number
  startTime: Date
  notes?: string
}

export interface UpdateSessionRequest extends Partial<CreateSessionRequest> {
  id: number
  endTime?: Date
  status?: "planned" | "in_progress" | "completed" | "cancelled"
}

export interface CreateGoalRequest {
  title: string
  description: string
  targetValue: number
  unit: string
  deadline: Date
  category: "strength" | "endurance" | "weight" | "custom"
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {
  id: number
  currentValue?: number
  status?: "active" | "completed" | "cancelled"
  type?: "weight" | "reps" | "duration" | "frequency" | "streak"
}

export interface CreateExerciseSetRequest {
  sessionId: number
  exerciseId: number
  machineId: number
  setNumber: number
  reps: number
  weight: number
  restSeconds: number
  notes?: string
}

export interface UpdateExerciseSetRequest
  extends Partial<CreateExerciseSetRequest> {
  id: number
}

// 페이지네이션 타입들
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: string
  statusCode: number
}

// ============================================================================
// Dashboard & Analytics Types
// ============================================================================

export interface WorkoutStats {
  totalSessions: number
  totalWorkouts?: number
  totalExercises?: number
  totalDuration: number
  totalDurationMinutes?: number
  totalCaloriesBurned?: number
  totalCalories?: number
  averageDuration?: number
  averageWorkoutDuration?: number
  completionRate?: number
  weeklyProgress?: any[]
  monthlyProgress?: any[]
  longestStreak?: number
  currentStreak: number
  workoutStreak?: number
  favoriteMachines?: string[]
  favoriteExercises?: Array<{ name: string; count: number }>
  startDate?: Date
  lastWorkoutDate?: Date
  dailyStats?: DailyStats[]
  weeklyStats?: WeeklyStats[]
  monthlyStats?: MonthlyStats[]
  averageMood: number
  averageEnergy: number
  completedGoals: number
  activeGoals: number
  totalGoals?: number
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
  exercises: number
  progress: number
}

export interface MonthlyStats {
  month: string
  sessions: number
  duration: number
  calories: number
  exercises: number
  progress: number
  goals: number
}

// ============================================================================
// Workout Reminder Types
// ============================================================================

export interface WorkoutReminder {
  id: number
  userId: number
  title: string
  message: string
  scheduledTime: Date
  isActive: boolean
  repeatDays?: number[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateReminderRequest {
  title: string
  message: string
  scheduledTime: Date
  repeatDays?: number[]
}

export interface UpdateReminderRequest extends Partial<CreateReminderRequest> {
  id: number
  isActive?: boolean
}

// ============================================================================
// Progress Tracking Types
// ============================================================================

export interface ProgressEntry {
  id: number
  userId: number
  exerciseId: number
  machineId: number
  date: Date
  weight: number
  reps: number
  sets: number
  notes?: string
}

export interface ProgressChart {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
  }[]
}

// ============================================================================
// Goal Progress Types
// ============================================================================

export interface GoalProgressBarProps {
  current: number
  target: number
  label: string
  unit: string
  color?: string
  showPercentage?: boolean
}

export interface GoalProgress {
  goalId: number
  currentValue: number
  targetValue: number
  percentage: number
  remainingDays: number
  isOnTrack: boolean
}

// ============================================================================
// Session Card Types
// ============================================================================

export interface SessionCardProps {
  session: WorkoutSession
  onEdit?: (session: WorkoutSession) => void
  onDelete?: (sessionId: number) => void
  onComplete?: (sessionId: number) => void
  showActions?: boolean
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

export interface WorkoutStats {
  totalSessions: number
  totalWorkouts?: number // 호환성을 위한 별칭
  totalExercises?: number // 호환성을 위한 별칭
  totalDuration: number
  averageDuration?: number // 호환성을 위한 별칭
  completionRate?: number // 호환성을 위한 별칭
  weeklyProgress?: any[] // 호환성을 위한 별칭
  monthlyProgress?: any[] // 호환성을 위한 별칭
  averageMood: number
  averageEnergy: number
  completedGoals: number
  activeGoals: number
  currentStreak: number
  totalExp: number
  level: number
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
