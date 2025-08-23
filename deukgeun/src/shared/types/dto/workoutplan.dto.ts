// ============================================================================
// WorkoutPlanDTO - Data Transfer Object
// ============================================================================

import type { WorkoutPlanExerciseDTO } from "./workoutplanexercise.dto"

export interface WorkoutPlanDTO {
  id: number
  userId: number
  name: string
  description?: string
  difficulty: string
  duration: number
  estimated_duration_minutes?: number
  targetMuscleGroups?: string[]
  exercises: WorkoutPlanExerciseDTO[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Create DTO (for creating new WorkoutPlan)
export interface CreateWorkoutPlanDTO {
  id: number
  userId: number
  name: string
  description?: string
  difficulty: string
  duration: number
  estimated_duration_minutes?: number
  targetMuscleGroups?: string[]
  exercises: WorkoutPlanExerciseDTO[]
  isActive: boolean
}

// Update DTO (for updating existing WorkoutPlan)
export interface UpdateWorkoutPlanDTO {
  id?: number
  userId?: number
  name?: string
  description?: string
  difficulty?: string
  duration?: number
  estimated_duration_minutes?: number
  targetMuscleGroups?: string[]
  exercises?: WorkoutPlanExerciseDTO[]
  isActive?: boolean
}

// Response DTO (for API responses)
export interface WorkoutPlanDTOResponse {
  success: boolean
  data?: WorkoutPlanDTO
  message?: string
  error?: string
}

// List Response DTO
export interface WorkoutPlanDTOListResponse {
  success: boolean
  data?: WorkoutPlanDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
