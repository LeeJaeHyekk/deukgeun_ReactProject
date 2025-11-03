// ============================================================================
// Goal Types - 공통 타입 정의
// ============================================================================

export type GoalStatus = 'planned' | 'active' | 'paused' | 'completed' | 'done' | 'cancelled'

export type GoalType =
  | 'weight' | 'reps' | 'duration' | 'frequency' | 'streak'
  | 'muscle_gain' | 'fat_loss' | 'weight_loss' | 'endurance' | 'strength' | 'flexibility' | 'custom'

export interface TargetMetrics {
  muscleGain?: number
  fatLoss?: number
  weightTarget?: number
  workoutFrequency?: number
  durationWeeks?: number
  targetValue?: number
  currentValue?: number
  unit?: string
}

export interface Task {
  taskId: string
  name: string
  category?: string
  exerciseName?: string
  machineId?: number
  exerciseId?: number
  setCount: number
  repsPerSet: number
  weightPerSet?: number
  restTimeSec?: number
  durationSeconds?: number
  distanceMeters?: number
  completedSets?: number
  status?: 'pending' | 'in_progress' | 'completed'
  rpeRating?: number
  isPersonalBest?: boolean
  isCompleted?: boolean
  notes?: string
  photos?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface ActiveWorkout {
  sessionId: string | number
  goalId: string | number
  startTime: string
  endTime?: string
  progress?: number
  activeTaskId?: string
  currentSet?: number
  restTimerSec?: number
  addedTasks?: Task[]
  notes?: string
  photos?: string[]
  moodRating?: number
  energyLevel?: number
  totalDurationMinutes?: number
}

export interface ActionEntry {
  actionId: number
  exerciseId?: number
  exerciseName: string
  machineId?: number
  setNumber?: number
  sets?: number
  reps?: number
  weight?: number
  durationSeconds?: number
  distanceMeters?: number
  rpeRating?: number
  isPersonalBest?: boolean
  isCompleted?: boolean
  notes?: string
  createdAt?: string
}

export interface HistoryEntry {
  date: string
  sessionId: number
  sessionName?: string
  completedAt?: string
  totalDurationMinutes?: number
  totalSets?: number
  totalReps?: number
  expEarned?: number
  avgIntensity?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  summary?: {
    muscleGroups?: string[]
    equipmentUsed?: string[]
    comment?: string
  }
  actions?: ActionEntry[]
}

export interface CompletedWorkout {
  completedId: string
  goalId: string
  goalTitle?: string
  completedAt: string
  totalSets?: number
  totalReps?: number
  avgIntensity?: number
  expEarned?: number
  durationMin?: number
  summary?: {
    muscleGroups?: string[]
    equipmentUsed?: string[]
    comment?: string
  }
  graphData?: any
}

export interface WorkoutGoal {
  userId: number | string
  goalId?: number | null
  goalTitle: string
  goalType: GoalType
  description?: string
  category?: string
  targetMetrics?: TargetMetrics
  progress?: {
    currentWeight?: number
    currentMuscleMass?: number
    currentFatMass?: number
    completedWorkouts?: number
    completedTasks?: number
    totalTasks?: number
    achievementRate?: number
    progressPercentage?: number
  }
  status?: GoalStatus
  isCompleted?: boolean
  completedAt?: string
  startDate?: string
  endDate?: string
  deadline?: string
  targetDate?: string
  createdAt?: string
  updatedAt?: string
  notes?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  expReward?: number
  planId?: number
  exerciseId?: number
  gymId?: number
  tasks?: Task[]
  activeWorkout?: ActiveWorkout | null
  history?: HistoryEntry[]
  completedWorkouts?: CompletedWorkout[]
}

