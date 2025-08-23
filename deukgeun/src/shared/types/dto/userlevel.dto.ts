// ============================================================================
// UserLevelDTO - Data Transfer Object
// ============================================================================

export interface UserLevelDTO {
  id: number
  userId: number
  level: number
  currentExp: number
  totalExp: number
  seasonExp: number
  totalLevelUps: number
  lastLevelUpAt?: Date
  currentSeason: number
  seasonStartDate?: Date
  seasonEndDate?: Date
  createdAt: Date
  updatedAt: Date
}

// Create DTO (for creating new UserLevel)
export interface CreateUserLevelDTO {
  id: number
  userId: number
  level: number
  currentExp: number
  totalExp: number
  seasonExp: number
  totalLevelUps: number
  currentSeason: number
  seasonStartDate?: Date
  seasonEndDate?: Date
}

// Update DTO (for updating existing UserLevel)
export interface UpdateUserLevelDTO {
  id?: number
  userId?: number
  level?: number
  currentExp?: number
  totalExp?: number
  seasonExp?: number
  totalLevelUps?: number
  currentSeason?: number
  seasonStartDate?: Date
  seasonEndDate?: Date
}

// Response DTO (for API responses)
export interface UserLevelDTOResponse {
  success: boolean
  data?: UserLevelDTO
  message?: string
  error?: string
}

// List Response DTO
export interface UserLevelDTOListResponse {
  success: boolean
  data?: UserLevelDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
