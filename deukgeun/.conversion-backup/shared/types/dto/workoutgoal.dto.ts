// ============================================================================
// WorkoutGoalDTO - Data Transfer Object
// ============================================================================

export interface WorkoutGoalDTO {
  id: number
  goal_id?: number
  userId: number
  title: string
  description?: string
  type: "weight" | "reps" | "duration" | "frequency" | "streak" | "custom"
  targetValue: number
  currentValue: number
  unit: string
  deadline?: Date
  isCompleted: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Create DTO (for creating new WorkoutGoal)
export interface CreateWorkoutGoalDTO {
  id: number
  userId: number
  title: string
  description?: string
  type: "weight" | "reps" | "duration" | "frequency" | "streak" | "custom"
  targetValue: number
  currentValue: number
  unit: string
  deadline?: Date
  isCompleted: boolean
}

// Update DTO (for updating existing WorkoutGoal)
export interface UpdateWorkoutGoalDTO {
  id?: number
  userId?: number
  title?: string
  description?: string
  type?: "weight" | "reps" | "duration" | "frequency" | "custom"
  targetValue?: number
  currentValue?: number
  unit?: string
  deadline?: Date
  isCompleted?: boolean
  completedAt?: Date
}

// Response DTO (for API responses)
export interface WorkoutGoalDTOResponse {
  success: boolean
  data?: WorkoutGoalDTO
  message?: string
  error?: string
}

// List Response DTO
export interface WorkoutGoalDTOListResponse {
  success: boolean
  data?: WorkoutGoalDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
