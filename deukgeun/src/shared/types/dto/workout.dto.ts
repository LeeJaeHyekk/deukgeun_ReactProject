// ============================================================================
// 워크아웃 관련 DTO 타입들
// ============================================================================

// 워크아웃 계획 DTO
export interface WorkoutPlanDTO {
  id: string
  userId: string
  name: string
  description?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDurationMinutes: number
  targetMuscleGroups?: string[]
  isTemplate: boolean
  isPublic: boolean
  status: "active" | "archived" | "draft"
  createdAt: Date
  updatedAt: Date
}

export interface CreateWorkoutPlanDTO {
  name: string
  description?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDurationMinutes: number
  targetMuscleGroups?: string[]
  isTemplate?: boolean
  isPublic?: boolean
}

export interface UpdateWorkoutPlanDTO extends Partial<CreateWorkoutPlanDTO> {
  id: string
}

export interface WorkoutPlanDTOResponse {
  success: boolean
  data: WorkoutPlanDTO
  message?: string
}

export interface WorkoutPlanDTOListResponse {
  success: boolean
  data: WorkoutPlanDTO[]
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 워크아웃 계획 운동 DTO
export interface WorkoutPlanExerciseDTO {
  id: string
  planId: string
  machineId?: string
  exerciseName: string
  exerciseOrder: number
  sets: number
  repsRange: { min: number; max: number }
  weightRange?: { min: number; max: number }
  restSeconds: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateWorkoutPlanExerciseDTO {
  planId: string
  machineId?: string
  exerciseName: string
  exerciseOrder: number
  sets: number
  repsRange: { min: number; max: number }
  weightRange?: { min: number; max: number }
  restSeconds: number
  notes?: string
}

export interface UpdateWorkoutPlanExerciseDTO
  extends Partial<CreateWorkoutPlanExerciseDTO> {
  id: string
}

export interface WorkoutPlanExerciseDTOResponse {
  success: boolean
  data: WorkoutPlanExerciseDTO
  message?: string
}

// 워크아웃 세션 DTO
export interface WorkoutSessionDTO {
  id: string
  userId: string
  planId?: string
  gymId?: string
  name: string
  startTime: Date
  endTime?: Date
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  status: "in_progress" | "completed" | "paused" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface CreateWorkoutSessionDTO {
  planId?: string
  gymId?: string
  name: string
  startTime: Date
  notes?: string
}

export interface UpdateWorkoutSessionDTO
  extends Partial<CreateWorkoutSessionDTO> {
  id: string
  endTime?: Date
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  status?: "in_progress" | "completed" | "paused" | "cancelled"
}

export interface WorkoutSessionDTOResponse {
  success: boolean
  data: WorkoutSessionDTO
  message?: string
}

export interface WorkoutSessionDTOListResponse {
  success: boolean
  data: WorkoutSessionDTO[]
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 워크아웃 목표 DTO
export interface WorkoutGoalDTO {
  id: string
  userId: string
  title: string
  description?: string
  type: "weight" | "reps" | "duration" | "frequency" | "streak"
  targetValue: number
  currentValue: number
  unit: string
  deadline?: Date
  isCompleted: boolean
  completedAt?: Date
  planId?: string
  exerciseId?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateWorkoutGoalDTO {
  title: string
  description?: string
  type: "weight" | "reps" | "duration" | "frequency" | "streak"
  targetValue: number
  currentValue?: number
  unit: string
  deadline?: Date
  planId?: string
  exerciseId?: string
}

export interface UpdateWorkoutGoalDTO extends Partial<CreateWorkoutGoalDTO> {
  id: string
  isCompleted?: boolean
  completedAt?: Date
}

export interface WorkoutGoalDTOResponse {
  success: boolean
  data: WorkoutGoalDTO
  message?: string
}

export interface WorkoutGoalDTOListResponse {
  success: boolean
  data: WorkoutGoalDTO[]
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 운동 세트 DTO
export interface ExerciseSetDTO {
  id: string
  sessionId: string
  machineId: string
  exerciseName: string
  setNumber: number
  repsCompleted: number
  weightKg?: number
  durationSeconds?: number
  distanceMeters?: number
  rpeRating?: number
  notes?: string
  isPersonalBest: boolean
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateExerciseSetDTO {
  sessionId: string
  machineId: string
  exerciseName: string
  setNumber: number
  repsCompleted: number
  weightKg?: number
  durationSeconds?: number
  distanceMeters?: number
  rpeRating?: number
  notes?: string
  isPersonalBest?: boolean
  isCompleted?: boolean
}

export interface UpdateExerciseSetDTO extends Partial<CreateExerciseSetDTO> {
  id: string
}

export interface ExerciseSetDTOResponse {
  success: boolean
  data: ExerciseSetDTO
  message?: string
}

export interface ExerciseSetDTOListResponse {
  success: boolean
  data: ExerciseSetDTO[]
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 대시보드 데이터 DTO
export interface DashboardData {
  totalWorkouts: number
  totalSessions: number
  totalGoals: number
  completedGoals: number
  currentStreak: number
  totalExp: number
  level: number
  summary: {
    totalWorkouts: number
    totalGoals: number
    totalSessions: number
    totalPlans: number
    completedSessions: number
    streak: number
    activeGoals: number
  }
  weeklyStats: {
    totalSessions: number
    totalDuration: number
    averageMood: number
    averageEnergy: number
  }
  recentSessions: Array<{
    id: string
    name: string
    date: Date
    duration: number
  }>
  activeGoals: Array<{
    id: string
    title: string
    type: string
    targetValue: number
    currentValue: number
    unit: string
    deadline?: Date
    isCompleted: boolean
  }>
  recentProgress: Array<{
    date: Date
    value: number
    type: string
  }>
  upcomingGoals: Array<{
    id: string
    title: string
    deadline: Date
    progress: number
  }>
  weeklyProgress: Array<{
    date: Date
    workouts: number
    exp: number
  }>
}

// 워크아웃 통계 DTO
export interface WorkoutStatsDTO {
  id: string
  userId: string
  totalWorkouts: number
  totalDuration: number
  totalCalories: number
  averageRating: number
  createdAt: Date
  updatedAt: Date
}

// 워크아웃 알림 DTO
export interface WorkoutReminderDTO {
  id: string
  userId: string
  title: string
  message: string
  description?: string
  time?: string
  days?: string[]
  scheduledTime: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// 목표 진행률 바 Props
export interface GoalProgressBarProps {
  goal: WorkoutGoalDTO
  className?: string
}

// 세션 카드 Props
export interface SessionCardProps {
  session: WorkoutSessionDTO
  onEdit?: (session: WorkoutSessionDTO) => void
  onDelete?: (sessionId: string) => void
  className?: string
}

// 페이지네이션 파라미터
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}
