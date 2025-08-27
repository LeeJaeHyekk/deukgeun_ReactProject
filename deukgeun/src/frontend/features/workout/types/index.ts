// ============================================================================
// Workout Feature Types Export
// ============================================================================

export * from "./workout"

// 운동 계획 관련 타입
export interface WorkoutPlanDTO {
  id: number
  name: string
  description?: string
  difficulty: "쉬움" | "보통" | "어려움"
  totalDurationMinutes: number
  exercises: ExerciseItem[]
  progress: number
  streak: number
  badge?: string
  createdAt: string
  updatedAt: string
}

export interface ExerciseItem {
  id: number
  name: string
  machineId?: number
  setCount: number
  setDurationSeconds: number
  order: number
}

// 운동 목표 관련 타입
export interface WorkoutGoalDTO {
  id: number
  title: string
  description?: string
  type: "weight" | "reps" | "duration" | "frequency" | "streak"
  targetValue: number
  currentValue: number
  unit: string
  deadline?: string
  isCompleted: boolean
  completedAt?: string
  planId?: number
  exerciseId?: number
  createdAt: string
  updatedAt: string
}

// 운동 세션 관련 타입
export interface WorkoutSessionDTO {
  id: number
  planId?: number
  gymId?: number
  name: string
  startTime?: string
  endTime?: string
  totalDurationMinutes: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  status: "completed" | "cancelled" | "paused" | "in_progress"
  exerciseSets: ExerciseSetDTO[]
  caloriesBurned?: number
  totalWeight?: number
  totalSets: number
  totalReps: number
  createdAt: string
  updatedAt: string
}

export interface ExerciseSetDTO {
  id: number
  machineId: number
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
}

// 운동 통계 관련 타입
export interface WorkoutStatsDTO {
  totalSessions: number
  totalDurationMinutes: number
  totalCaloriesBurned: number
  longestStreak: number
  currentStreak: number
  favoriteMachines: string[]
  favoriteExercises: string[]
  startDate: string
  lastWorkoutDate?: string
  dailyStats: DailyStats[]
  weeklyStats: WeeklyStats[]
  monthlyStats: MonthlyStats[]
}

export interface DailyStats {
  date: string
  totalSessions: number
  totalDurationMinutes: number
  totalSets: number
  totalReps: number
  totalWeightKg: number
  totalDistanceMeters: number
  averageMood: number
  averageEnergy: number
  averageRpe: number
  caloriesBurned: number
  machinesUsed: string[]
  exercisesCompleted: string[]
}

export interface WeeklyStats {
  weekStart: string
  weekEnd: string
  totalSessions: number
  totalDurationMinutes: number
  averageSessionsPerDay: number
  averageDurationPerSession: number
  mostUsedMachines: string[]
  mostCompletedExercises: string[]
  streakDays: number
}

export interface MonthlyStats {
  month: string
  totalSessions: number
  totalDurationMinutes: number
  totalCaloriesBurned: number
  averageSessionsPerWeek: number
  personalBests: string[]
  goalsAchieved: string[]
  improvementRate: number
}



// 기구 관련 타입
export interface MachineDTO {
  id: number
  name: string
  imageUrl?: string
  category: string
  description?: string
}

// 헬스장 관련 타입
export interface GymDTO {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
}
