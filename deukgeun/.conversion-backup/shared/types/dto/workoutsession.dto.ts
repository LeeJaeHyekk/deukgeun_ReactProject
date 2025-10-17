// ============================================================================
// WorkoutSessionDTO - Data Transfer Object
// ============================================================================

import type { ExerciseSetDTO } from "@shared/types/dto/exerciseset.dto"

export interface WorkoutSessionDTO {
  id: number
  userId: number
  planId?: number
  gymId?: number
  name: string
  description?: string
  startTime: Date
  endTime?: Date
  duration?: number
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  status: "in_progress" | "completed" | "paused" | "cancelled"
  isCompleted?: boolean
  exerciseSets: ExerciseSetDTO[]
  createdAt: Date
  updatedAt: Date
}

// Create DTO (for creating new WorkoutSession)
export interface CreateWorkoutSessionDTO {
  id: number
  userId: number
  planId?: number
  gymId?: number
  name: string
  description?: string
  startTime: Date
  endTime?: Date
  duration?: number
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  status: "in_progress" | "completed" | "paused" | "cancelled"
  isCompleted?: boolean
  exerciseSets: ExerciseSetDTO[]
}

// Update DTO (for updating existing WorkoutSession)
export interface UpdateWorkoutSessionDTO {
  id?: number
  userId?: number
  planId?: number
  gymId?: number
  name?: string
  description?: string
  startTime?: Date
  endTime?: Date
  duration?: number
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  status?: "in_progress" | "completed" | "paused" | "cancelled"
  isCompleted?: boolean
  exerciseSets?: ExerciseSetDTO[]
}

// Response DTO (for API responses)
export interface WorkoutSessionDTOResponse {
  success: boolean
  data?: WorkoutSessionDTO
  message?: string
  error?: string
}

// List Response DTO
export interface WorkoutSessionDTOListResponse {
  success: boolean
  data?: WorkoutSessionDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
