// DTO 타입들 (백엔드와의 호환성을 위해)
export interface WorkoutPlanDTO {
  id: number
  userId: number
  name: string
  description?: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDurationMinutes: number
  isActive: boolean
  exercises: WorkoutPlanExerciseDTO[]
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutPlanExerciseDTO {
  id: number
  planId: number
  exerciseId: number
  machineId?: number
  exerciseName?: string
  order: number
  sets: number
  reps: number
  weight?: number
  duration?: number
  restTime: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutGoalDTO {
  id: number
  userId: number
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  deadline: Date
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutSessionDTO {
  id: number
  userId: number
  planId: number
  startTime: Date
  endTime?: Date
  totalDurationMinutes: number
  status: "planned" | "in_progress" | "completed" | "cancelled"
  exerciseSets: ExerciseSet[]
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface ExerciseSet {
  id: number
  sessionId: number
  machineId: number
  setNumber: number
  repsCompleted: number
  weightKg: number
  isPersonalBest: boolean
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}
