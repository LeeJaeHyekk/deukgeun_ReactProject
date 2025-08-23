// ============================================================================
// WorkoutSessionDTO - Data Transfer Object
// ============================================================================

export interface WorkoutSessionDTO {
  id: number
  userId: number
  planId?: number
  gymId?: number
  name: string
  startTime: Date
  endTime?: Date
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  status: unknown
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
  startTime: Date
  endTime?: Date
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  status: unknown
}

// Update DTO (for updating existing WorkoutSession)
export interface UpdateWorkoutSessionDTO {
  id?: number
  userId?: number
  planId?: number
  gymId?: number
  name?: string
  startTime?: Date
  endTime?: Date
  totalDurationMinutes?: number
  moodRating?: number
  energyLevel?: number
  notes?: string
  status?: unknown
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
