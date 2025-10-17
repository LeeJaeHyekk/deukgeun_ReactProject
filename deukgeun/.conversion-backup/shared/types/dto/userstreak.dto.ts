// ============================================================================
// UserStreakDTO - Data Transfer Object
// ============================================================================

export interface UserStreakDTO {
  id: number
  userId: number
  streakType: string
  currentStreak: number
  longestStreak: number
  lastActivityDate: Date
  startDate: Date
  endDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Create DTO (for creating new UserStreak)
export interface CreateUserStreakDTO {
  id: number
  userId: number
  streakType: string
  currentStreak: number
  longestStreak: number
  lastActivityDate: Date
  startDate: Date
  isActive: boolean
}

// Update DTO (for updating existing UserStreak)
export interface UpdateUserStreakDTO {
  id?: number
  userId?: number
  streakType?: string
  currentStreak?: number
  longestStreak?: number
  lastActivityDate?: Date
  startDate?: Date
  endDate?: Date
  isActive?: boolean
}

// Response DTO (for API responses)
export interface UserStreakDTOResponse {
  success: boolean
  data?: UserStreakDTO
  message?: string
  error?: string
}

// List Response DTO
export interface UserStreakDTOListResponse {
  success: boolean
  data?: UserStreakDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
