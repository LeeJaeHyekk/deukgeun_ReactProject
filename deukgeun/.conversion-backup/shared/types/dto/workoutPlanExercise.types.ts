// ============================================================================
// WorkoutPlanExercise DTOs - Data Transfer Objects
// ============================================================================

import type { BaseDTO } from "@shared/types/dto/index"

export interface WorkoutPlanExerciseDTO extends BaseDTO {
  id: number
  planId: number
  exerciseId: number
  machineId?: number
  exerciseName: string
  exerciseOrder: number
  sets: number
  repsRange: {
    min: number
    max: number
  }
  weightRange?: {
    min: number
    max: number
  }
  restSeconds: number
  notes?: string
}

// Create DTO (for creating new WorkoutPlanExercise)
export interface CreateWorkoutPlanExerciseDTO {
  planId: number
  exerciseId: number
  machineId?: number
  exerciseName: string
  exerciseOrder: number
  sets: number
  repsRange: {
    min: number
    max: number
  }
  weightRange?: {
    min: number
    max: number
  }
  restSeconds: number
  notes?: string
}

// Update DTO (for updating existing WorkoutPlanExercise)
export interface UpdateWorkoutPlanExerciseDTO {
  id?: number
  planId?: number
  exerciseId?: number
  machineId?: number
  exerciseName?: string
  exerciseOrder?: number
  sets?: number
  repsRange?: {
    min: number
    max: number
  }
  weightRange?: {
    min: number
    max: number
  }
  restSeconds?: number
  notes?: string
}

// Form DTO (for form handling)
export interface WorkoutPlanExerciseForm {
  id?: number
  planId: number
  exerciseId: number
  machineId?: number
  exerciseName: string
  exerciseOrder: number
  sets: number
  repsRange: {
    min: number
    max: number
  }
  weightRange?: {
    min: number
    max: number
  }
  restSeconds: number
  notes?: string
  // Legacy properties for backward compatibility
  reps?: number
  weight?: number
  restTime?: number
  order?: number
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

// Type aliases for backward compatibility
export type WorkoutPlanExercise = WorkoutPlanExerciseDTO
export type CreateWorkoutPlanExercise = CreateWorkoutPlanExerciseDTO
export type UpdateWorkoutPlanExercise = UpdateWorkoutPlanExerciseDTO