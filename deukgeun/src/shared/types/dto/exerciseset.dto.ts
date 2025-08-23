// ============================================================================
// ExerciseSetDTO - Data Transfer Object
// ============================================================================

export interface ExerciseSetDTO {
  id: number
  sessionId: number
  machineId: number
  setNumber: number
  repsCompleted: number
  weightKg?: number
  durationSeconds?: number
  distanceMeters?: number
  rpeRating?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Create DTO (for creating new ExerciseSet)
export interface CreateExerciseSetDTO {
  id: number
  sessionId: number
  machineId: number
  setNumber: number
  repsCompleted: number
  weightKg?: number
  durationSeconds?: number
  distanceMeters?: number
  rpeRating?: number
  notes?: string
}

// Update DTO (for updating existing ExerciseSet)
export interface UpdateExerciseSetDTO {
  id?: number
  sessionId?: number
  machineId?: number
  setNumber?: number
  repsCompleted?: number
  weightKg?: number
  durationSeconds?: number
  distanceMeters?: number
  rpeRating?: number
  notes?: string
}

// Response DTO (for API responses)
export interface ExerciseSetDTOResponse {
  success: boolean
  data?: ExerciseSetDTO
  message?: string
  error?: string
}

// List Response DTO
export interface ExerciseSetDTOListResponse {
  success: boolean
  data?: ExerciseSetDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
