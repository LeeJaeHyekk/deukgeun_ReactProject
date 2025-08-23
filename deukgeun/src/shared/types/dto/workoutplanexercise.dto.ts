// ============================================================================
// WorkoutPlanExerciseDTO - Data Transfer Object
// ============================================================================

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

// Create DTO (for creating new WorkoutPlanExercise)
export interface CreateWorkoutPlanExerciseDTO {
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
}

// Update DTO (for updating existing WorkoutPlanExercise)
export interface UpdateWorkoutPlanExerciseDTO {
  id?: number
  planId?: number
  exerciseId?: number
  machineId?: number
  exerciseName?: string
  order?: number
  sets?: number
  reps?: number
  weight?: number
  duration?: number
  restTime?: number
  notes?: string
}

// Response DTO (for API responses)
export interface WorkoutPlanExerciseDTOResponse {
  success: boolean
  data?: WorkoutPlanExerciseDTO
  message?: string
  error?: string
}

// List Response DTO
export interface WorkoutPlanExerciseDTOListResponse {
  success: boolean
  data?: WorkoutPlanExerciseDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
