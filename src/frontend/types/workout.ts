// ============================================================================
// 워크아웃 관련 타입 정의
// ============================================================================

export interface Exercise {
  id: string
  name: string
  category: string
  muscleGroups: string[]
  equipment?: string
  instructions?: string[]
  tips?: string[]
}

export interface WorkoutSet {
  id: string
  reps: number
  weight: number
  duration?: number
  restTime?: number
  notes?: string
}

export interface Workout {
  id: string
  exerciseId: string
  exercise: Exercise
  sets: WorkoutSet[]
  date: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface WorkoutPlan {
  id: string
  name: string
  description?: string
  exercises: Exercise[]
  duration: number // 주 단위
  difficulty: "beginner" | "intermediate" | "advanced"
  goal: "strength" | "endurance" | "muscle" | "weightLoss"
  isPublic: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface WorkoutSession {
  id: string
  planId?: string
  workouts: Workout[]
  startTime: string
  endTime?: string
  totalDuration?: number
  notes?: string
  createdAt: string
}

export interface WorkoutStats {
  totalWorkouts: number
  totalDuration: number
  averageDuration: number
  favoriteExercise: string
  totalWeight: number
  personalRecords: PersonalRecord[]
}

export interface PersonalRecord {
  exerciseId: string
  exerciseName: string
  maxWeight: number
  maxReps: number
  date: string
}

export interface WorkoutGoal {
  id: string
  type: "weight" | "reps" | "duration" | "frequency"
  target: number
  current: number
  deadline: string
  isAchieved: boolean
  createdAt: string
}

export interface ExerciseSet {
  id: string
  reps: number
  weight: number
  duration?: number
  restTime?: number
  notes?: string
}

export interface WorkoutPlanExercise {
  id: string
  exerciseId: string
  exercise: Exercise
  sets: ExerciseSet[]
  order: number
  notes?: string
}